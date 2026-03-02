import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Grid, Paper, Typography, Box, CircularProgress, Divider,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, LinearProgress, IconButton, Tooltip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import api from '../api/axios';

const STATUS_CHIP = {
    paid: { label: 'Paid', color: 'success' },
    pending: { label: 'Pending', color: 'warning' },
    failed: { label: 'Failed', color: 'error' },
    cancelled: { label: 'Cancelled', color: 'default' },
};

function StatCard({ label, value, icon, color, sub }) {
    return (
        <Paper elevation={0} sx={{
            p: 3, borderRadius: 3,
            border: `1px solid ${color}33`,
            borderLeft: `5px solid ${color}`,
            display: 'flex', flexDirection: 'column', gap: 0.5
        }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" letterSpacing={1}>
                        {label}
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ color, mt: 0.5 }}>
                        {value ?? <CircularProgress size={22} sx={{ color }} />}
                    </Typography>
                    {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
                </Box>
                <Box sx={{ backgroundColor: `${color}18`, borderRadius: 2, p: 1.2, color }}>
                    {icon}
                </Box>
            </Box>
        </Paper>
    );
}

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/dashboard');
            if (response.data.success) setStats(response.data.stats);
        } catch (error) {
            console.error("Failed to fetch dashboard stats", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

    const bookingCompletion = stats
        ? Math.round((parseInt(stats.paid_bookings) / Math.max(parseInt(stats.total_bookings), 1)) * 100)
        : 0;

    return (
        <Box>
            {/* Title */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight={800}>Dashboard</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Live overview of your event platform
                    </Typography>
                </Box>
                <Tooltip title="Refresh">
                    <IconButton onClick={fetchStats} disabled={loading}>
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* ── Stat Cards Row 1: Platform ── */}
            <Typography variant="overline" color="text.secondary" fontWeight={700} letterSpacing={1.5}>
                Platform Overview
            </Typography>
            <Grid container spacing={2} mb={4} mt={0.5}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard label="Total Users" value={stats?.total_users} color="#6C63FF" icon={<PeopleIcon />} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard label="Active Modules" value={stats?.active_modules} color="#2196F3" icon={<AccountTreeIcon />} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard label="Total Events" value={stats?.total_events} color="#00BCD4" icon={<EventIcon />} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        label="Revenue"
                        value={stats ? `$${parseFloat(stats.total_revenue || 0).toFixed(2)}` : null}
                        color="#4CAF50"
                        icon={<AttachMoneyIcon />}
                        sub="From confirmed bookings"
                    />
                </Grid>
            </Grid>

            {/* ── Stat Cards Row 2: Bookings ── */}
            <Typography variant="overline" color="text.secondary" fontWeight={700} letterSpacing={1.5}>
                Ticket Bookings
            </Typography>
            <Grid container spacing={2} mb={4} mt={0.5}>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard label="Total Bookings" value={stats?.total_bookings} color="#9C27B0" icon={<ConfirmationNumberIcon />} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard label="Confirmed (Paid)" value={stats?.paid_bookings} color="#4CAF50" icon={<ConfirmationNumberIcon />} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard label="Pending Payment" value={stats?.pending_bookings} color="#FF9800" icon={<HourglassEmptyIcon />} />
                </Grid>
            </Grid>

            {/* Completion rate */}
            {stats && parseInt(stats.total_bookings) > 0 && (
                <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" fontWeight={700}>Booking Completion Rate</Typography>
                        <Typography variant="body2" fontWeight={800} color="success.main">{bookingCompletion}%</Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={bookingCompletion}
                        sx={{
                            height: 10, borderRadius: 5, backgroundColor: 'grey.100',
                            '& .MuiLinearProgress-bar': { borderRadius: 5, backgroundColor: '#4CAF50' }
                        }}
                    />
                    <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                        {stats.paid_bookings} of {stats.total_bookings} bookings confirmed
                    </Typography>
                </Paper>
            )}

            {/* ── Recent Bookings Table ── */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="subtitle1" fontWeight={700}>Recent Bookings</Typography>
                <Typography
                    variant="caption" color="primary" sx={{ cursor: 'pointer', fontWeight: 700 }}
                    onClick={() => navigate('/allotment')}
                >
                    View All Events →
                </Typography>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                {loading ? <LinearProgress /> : null}
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.50' }}>
                            <TableCell sx={{ fontWeight: 700 }}>Ref</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Event</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Tier</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {!stats?.recent_bookings?.length ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                    {loading ? 'Loading…' : 'No bookings yet'}
                                </TableCell>
                            </TableRow>
                        ) : stats.recent_bookings.map(b => (
                            <TableRow key={b.booking_id} hover>
                                <TableCell>
                                    <Typography variant="caption" fontFamily="monospace" fontWeight={700} color="primary">
                                        {b.booking_reference}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={600}>{b.customer_name}</Typography>
                                    <Typography variant="caption" color="text.secondary">{b.customer_mobile}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>{b.event_title}</Typography>
                                </TableCell>
                                <TableCell>
                                    {b.tier_name ? <Chip size="small" label={b.tier_name} /> : '—'}
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={700}>
                                        ${parseFloat(b.amount_paid).toFixed(2)}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        size="small"
                                        label={(STATUS_CHIP[b.payment_status] || STATUS_CHIP.pending).label}
                                        color={(STATUS_CHIP[b.payment_status] || STATUS_CHIP.pending).color}
                                    />
                                </TableCell>
                                <TableCell>
                                    {b.payment_status === 'paid' && (
                                        <Tooltip title="Download PDF Ticket">
                                            <IconButton
                                                size="small"
                                                href={`${api.defaults.baseURL}/booking/ticket/${b.booking_id}`}
                                                target="_blank"
                                            >
                                                <ConfirmationNumberIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Dashboard;
