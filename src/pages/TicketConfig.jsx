import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, Button, TextField, IconButton,
    Grid, Chip, Divider, Alert, CircularProgress, Tooltip,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab,
    InputAdornment, Slider, Switch, FormControlLabel
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import PeopleIcon from '@mui/icons-material/People';
import api from '../api/axios';

// ─── Predefined tier presets ──────────────────────────────────────────────────
const TIER_PRESETS = [
    { tier_name: 'Silver', price: '', total_seats: 100, color: '#9E9E9E', description: 'Standard access' },
    { tier_name: 'Gold', price: '', total_seats: 50, color: '#FFB300', description: 'Premium access with reserved seating' },
    { tier_name: 'Premium', price: '', total_seats: 20, color: '#AB47BC', description: 'VIP experience with exclusive benefits' },
];

// ─── Mini Seat Preview ────────────────────────────────────────────────────────
function SeatPreview({ rows, cols, color }) {
    const seats = Array.from({ length: rows * cols }, (_, i) => i + 1);
    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: cols * 30, mt: 1 }}>
            {seats.map(s => (
                <Box key={s} sx={{
                    width: 22, height: 22, borderRadius: '4px',
                    backgroundColor: `${color}22`, border: `1.5px solid ${color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '8px', fontWeight: 700, color
                }}>{s}</Box>
            ))}
        </Box>
    );
}

const TicketConfig = () => {
    const { event_id } = useParams();
    const navigate = useNavigate();
    const [tab, setTab] = useState(0);

    // ── State ──
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const [eventTitle, setEventTitle] = useState('');
    const [tiers, setTiers] = useState([]);
    const [hasTiers, setHasTiers] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);

    // Seat map config
    const [seatRows, setSeatRows] = useState(6);
    const [seatCols, setSeatCols] = useState(10);
    const [seatColor, setSeatColor] = useState('#6C63FF');

    useEffect(() => { loadData(); }, [event_id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/booking/tiers/${event_id}`);
            if (res.data.success) {
                setHasTiers(res.data.has_tiers);
                if (res.data.tiers && res.data.tiers.length > 0) {
                    setTiers(res.data.tiers.map(t => ({
                        ...t,
                        price: String(t.price),
                        total_seats: Number(t.total_seats)
                    })));
                    // Infer seat config from first tier
                    const first = res.data.tiers[0];
                    const cols = 10;
                    setSeatRows(Math.ceil(Number(first.total_seats) / cols));
                    setSeatCols(cols);
                    setSeatColor(first.color || '#6C63FF');
                } else {
                    // Prefill with presets
                    setTiers(TIER_PRESETS.map(p => ({ ...p })));
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const loadBookings = useCallback(async () => {
        setBookingsLoading(true);
        try {
            const res = await api.get(`/booking/list/${event_id}`);
            if (res.data.success) setBookings(res.data.bookings || []);
        } catch (e) { console.error(e); }
        finally { setBookingsLoading(false); }
    }, [event_id]);

    useEffect(() => {
        if (tab === 2) loadBookings();
    }, [tab, loadBookings]);

    // ── Tier editing helpers ──
    const handleTierChange = (index, field, value) => {
        setTiers(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
    };

    const addTier = () => {
        setTiers(prev => [...prev, {
            tier_name: '', price: '', total_seats: 50, color: '#4CAF50', description: ''
        }]);
    };

    const removeTier = (index) => {
        setTiers(prev => prev.filter((_, i) => i !== index));
    };

    const applyPreset = (preset) => {
        setTiers(prev => {
            const exists = prev.findIndex(t => t.tier_name.toLowerCase() === preset.tier_name.toLowerCase());
            if (exists >= 0) return prev;
            return [...prev, { ...preset }];
        });
    };

    // ── Save tiers ──
    const saveTiers = async () => {
        const invalid = tiers.filter(t => !t.tier_name.trim() || !t.price || isNaN(parseFloat(t.price)));
        if (invalid.length > 0) {
            setError('All tiers must have a name and a valid price.');
            return;
        }

        setSaving(true); setError(''); setSuccess('');
        try {
            // Update seat count from seat config for each tier
            const tiersToSave = tiers.map(t => ({
                ...t,
                total_seats: seatRows * seatCols,
                color: t.color
            }));

            const res = await api.post('/booking/tiers', {
                event_id: parseInt(event_id),
                tiers: tiersToSave
            });

            if (res.data.success) {
                setSuccess('Ticket tiers saved successfully!');
                setTiers(res.data.tiers.map(t => ({
                    ...t, price: String(t.price), total_seats: Number(t.total_seats)
                })));
                setHasTiers(true);
            } else {
                setError(res.data.message || 'Save failed');
            }
        } catch (e) {
            setError('Failed to save: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    const statusColor = (status) => {
        if (status === 'paid') return 'success';
        if (status === 'failed') return 'error';
        if (status === 'cancelled') return 'default';
        return 'warning';
    };

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
        </Box>
    );

    return (
        <Box p={3}>
            {/* Header */}
            <Box display="flex" alignItems="center" mb={3} gap={2}>
                <IconButton onClick={() => navigate(-1)}>
                    <ArrowBackIcon />
                </IconButton>
                <Box flex={1}>
                    <Typography variant="h5" fontWeight={700}>
                        🎟️ Ticket Configuration
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Event ID: {event_id} • Configure tiers, seat map, and view bookings
                    </Typography>
                </Box>
            </Box>

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    indicatorColor="primary"
                    textColor="primary"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab icon={<LocalActivityIcon />} iconPosition="start" label="Ticket Tiers" />
                    <Tab icon={<EventSeatIcon />} iconPosition="start" label="Seat Map" />
                    <Tab icon={<PeopleIcon />} iconPosition="start" label="Bookings" />
                </Tabs>
            </Paper>

            {/* ─────────────────── TAB 0: TICKET TIERS ─────────────────── */}
            {tab === 0 && (
                <Box>
                    {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
                    {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

                    {/* Quick Presets */}
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Typography variant="subtitle2" fontWeight={700} mb={1}>
                            Quick Presets
                        </Typography>
                        <Box display="flex" gap={1} flexWrap="wrap">
                            {TIER_PRESETS.map(preset => (
                                <Chip
                                    key={preset.tier_name}
                                    label={`+ Add ${preset.tier_name}`}
                                    onClick={() => applyPreset(preset)}
                                    sx={{
                                        backgroundColor: `${preset.color}22`,
                                        border: `1.5px solid ${preset.color}`,
                                        color: preset.color,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        '&:hover': { backgroundColor: `${preset.color}44` }
                                    }}
                                />
                            ))}
                        </Box>
                    </Paper>

                    {/* Tier List */}
                    {tiers.map((tier, idx) => (
                        <Paper
                            key={idx}
                            sx={{
                                p: 3, mb: 2,
                                border: `2px solid ${tier.color || '#ccc'}44`,
                                borderLeft: `5px solid ${tier.color || '#6C63FF'}`,
                                borderRadius: 2
                            }}
                        >
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="subtitle1" fontWeight={700} sx={{ color: tier.color }}>
                                    {tier.tier_name || `Tier ${idx + 1}`}
                                </Typography>
                                <IconButton color="error" size="small" onClick={() => removeTier(idx)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        fullWidth
                                        label="Tier Name *"
                                        value={tier.tier_name}
                                        onChange={e => handleTierChange(idx, 'tier_name', e.target.value)}
                                        placeholder="e.g. Gold"
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        fullWidth
                                        label="Price *"
                                        type="number"
                                        value={tier.price}
                                        onChange={e => handleTierChange(idx, 'price', e.target.value)}
                                        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        fullWidth
                                        label="Total Seats"
                                        type="number"
                                        value={tier.total_seats}
                                        onChange={e => handleTierChange(idx, 'total_seats', parseInt(e.target.value) || 0)}
                                        size="small"
                                        helperText={tier.seats_booked ? `${tier.seats_booked} booked` : ''}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" mb={0.5} display="block">
                                            Badge Colour
                                        </Typography>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <input
                                                type="color"
                                                value={tier.color || '#6C63FF'}
                                                onChange={e => handleTierChange(idx, 'color', e.target.value)}
                                                style={{
                                                    width: 44, height: 36, border: 'none',
                                                    cursor: 'pointer', borderRadius: 4, padding: 2
                                                }}
                                            />
                                            <Typography variant="body2" fontFamily="monospace">
                                                {tier.color || '#6C63FF'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Description (optional)"
                                        value={tier.description || ''}
                                        onChange={e => handleTierChange(idx, 'description', e.target.value)}
                                        size="small"
                                        placeholder="e.g. Reserved front rows with refreshments"
                                    />
                                </Grid>
                            </Grid>

                            {/* Availability indicator */}
                            {tier.tier_id && (
                                <Box mt={1.5} display="flex" gap={2}>
                                    <Chip size="small" label={`${tier.total_seats - (tier.seats_booked || 0)} available`} color="success" variant="outlined" />
                                    {tier.seats_booked > 0 && (
                                        <Chip size="small" label={`${tier.seats_booked} booked`} color="warning" variant="outlined" />
                                    )}
                                </Box>
                            )}
                        </Paper>
                    ))}

                    {/* Add custom tier */}
                    <Button
                        startIcon={<AddIcon />}
                        onClick={addTier}
                        variant="outlined"
                        sx={{ mb: 3 }}
                    >
                        Add Custom Tier
                    </Button>

                    <Box display="flex" justifyContent="flex-end">
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<SaveIcon />}
                            onClick={saveTiers}
                            disabled={saving || tiers.length === 0}
                        >
                            {saving ? 'Saving…' : 'Save Ticket Tiers'}
                        </Button>
                    </Box>
                </Box>
            )}

            {/* ─────────────────── TAB 1: SEAT MAP ─────────────────── */}
            {tab === 1 && (
                <Box>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="subtitle1" fontWeight={700} mb={2}>
                            Seat Map Layout
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={3}>
                            Configure the seat grid shown in the mobile app. Total seats = Rows × Columns.
                            This setting applies globally to all tiers for this event.
                        </Typography>

                        <Grid container spacing={4} alignItems="flex-start">
                            <Grid item xs={12} sm={6}>
                                <Typography gutterBottom>Rows: <strong>{seatRows}</strong></Typography>
                                <Slider
                                    value={seatRows}
                                    onChange={(_, v) => setSeatRows(v)}
                                    min={1} max={20} step={1}
                                    marks={[
                                        { value: 1, label: '1' },
                                        { value: 10, label: '10' },
                                        { value: 20, label: '20' }
                                    ]}
                                    color="primary"
                                />

                                <Typography gutterBottom mt={2}>Columns: <strong>{seatCols}</strong></Typography>
                                <Slider
                                    value={seatCols}
                                    onChange={(_, v) => setSeatCols(v)}
                                    min={2} max={20} step={1}
                                    marks={[
                                        { value: 2, label: '2' },
                                        { value: 10, label: '10' },
                                        { value: 20, label: '20' }
                                    ]}
                                    color="secondary"
                                />

                                <Box mt={2}>
                                    <Typography variant="body2" gutterBottom>Seat Highlight Colour</Typography>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <input
                                            type="color"
                                            value={seatColor}
                                            onChange={e => setSeatColor(e.target.value)}
                                            style={{ width: 50, height: 40, cursor: 'pointer', borderRadius: 6 }}
                                        />
                                        <Typography variant="body2" fontFamily="monospace">{seatColor}</Typography>
                                    </Box>
                                </Box>

                                <Paper sx={{ p: 2, mt: 3, backgroundColor: 'grey.50' }}>
                                    <Typography variant="body2" color="text.secondary">Summary</Typography>
                                    <Typography variant="h6" fontWeight={700}>
                                        {seatRows} × {seatCols} = {seatRows * seatCols} seats
                                    </Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                {/* Live preview */}
                                <Paper sx={{ p: 2, backgroundColor: '#1a1a2e', borderRadius: 2 }}>
                                    <Typography variant="caption" sx={{ color: '#888', letterSpacing: 3, display: 'block', textAlign: 'center', mb: 1 }}>
                                        🎭 STAGE
                                    </Typography>
                                    <Divider sx={{ mb: 2, borderColor: '#ffffff22' }} />
                                    <SeatPreview
                                        rows={Math.min(seatRows, 8)}
                                        cols={Math.min(seatCols, 10)}
                                        color={seatColor}
                                    />
                                    {(seatRows > 8 || seatCols > 10) && (
                                        <Typography variant="caption" sx={{ color: '#888', mt: 1, display: 'block' }}>
                                            Preview clipped. Full map shown in app.
                                        </Typography>
                                    )}
                                </Paper>
                            </Grid>
                        </Grid>
                    </Paper>

                    <Alert severity="info" sx={{ mb: 2 }}>
                        <strong>Note:</strong> After updating the seat layout, click <strong>Save Ticket Tiers</strong> in the Tiers tab — the seat count (Rows × Cols) will be applied to all tiers automatically.
                    </Alert>
                </Box>
            )}

            {/* ─────────────────── TAB 2: BOOKINGS ─────────────────── */}
            {tab === 2 && (
                <Box>
                    {bookingsLoading ? (
                        <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
                    ) : (
                        <>
                            {/* Stats */}
                            <Grid container spacing={2} mb={3}>
                                {[
                                    { label: 'Total Bookings', value: bookings.length, color: '#6C63FF' },
                                    { label: 'Confirmed (Paid)', value: bookings.filter(b => b.payment_status === 'paid').length, color: '#4CAF50' },
                                    { label: 'Pending', value: bookings.filter(b => b.payment_status === 'pending').length, color: '#FF9800' },
                                    {
                                        label: 'Revenue',
                                        value: `$${bookings.filter(b => b.payment_status === 'paid').reduce((sum, b) => sum + parseFloat(b.amount_paid || 0), 0).toFixed(2)}`,
                                        color: '#2196F3'
                                    },
                                ].map(stat => (
                                    <Grid item xs={6} sm={3} key={stat.label}>
                                        <Paper sx={{ p: 2, textAlign: 'center', borderTop: `4px solid ${stat.color}` }}>
                                            <Typography variant="h5" fontWeight={800} sx={{ color: stat.color }}>
                                                {stat.value}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>

                            <TableContainer component={Paper}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>#</TableCell>
                                            <TableCell>Ref</TableCell>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Mobile</TableCell>
                                            <TableCell>Tier</TableCell>
                                            <TableCell>Seat</TableCell>
                                            <TableCell>Qty</TableCell>
                                            <TableCell>Amount</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {bookings.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={10} align="center">No bookings yet</TableCell>
                                            </TableRow>
                                        ) : bookings.map((b, i) => (
                                            <TableRow key={b.booking_id} hover>
                                                <TableCell>{b.booking_id}</TableCell>
                                                <TableCell>
                                                    <Typography variant="caption" fontFamily="monospace" fontWeight={700}>
                                                        {b.booking_reference || '—'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{b.customer_name}</TableCell>
                                                <TableCell>{b.customer_mobile}</TableCell>
                                                <TableCell>
                                                    {b.tier_name ? (
                                                        <Chip size="small" label={b.tier_name} />
                                                    ) : '—'}
                                                </TableCell>
                                                <TableCell>{b.seat_number || 'Open'}</TableCell>
                                                <TableCell>{b.quantity}</TableCell>
                                                <TableCell>${parseFloat(b.amount_paid).toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        label={b.payment_status}
                                                        color={statusColor(b.payment_status)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="caption">
                                                        {new Date(b.created_at).toLocaleDateString()}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default TicketConfig;
