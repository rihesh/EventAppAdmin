import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Button,
    IconButton,
    Switch,
    Radio,
    TextField
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../api/axios';

const Modules = () => {
    const navigate = useNavigate();
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const adminData = JSON.parse(localStorage.getItem('admin') || '{}');
        // AdminController returns { success: true, admin_id, username, app_id }
        // It does NOT return user_type currently, so we need to infer or add it to login response.
        // For now, let's look at how we implemented it.
        // Wait, AdminController.js login DOES NOT return user_type relative to the 'admin' table, but 'users' table has 'user_type'.

        const superAdmin = adminData.user_type === 1 || adminData.admin_id === 1;
        setIsAdmin(superAdmin);

        const adminId = adminData.admin_id || (adminData.user && adminData.user.user_id);

        const fetchModules = async () => {
            try {
                // Pass admin_id to get personalized modules
                const response = await api.get('/admin/modules', {
                    params: { admin_id: adminId, is_super: superAdmin ? '1' : '0' }
                });
                if (response.data.success) {
                    setModules(response.data.modules);
                }
            } catch (error) {
                console.error("Failed to fetch modules", error);
            } finally {
                setLoading(false);
            }
        };

        fetchModules();
    }, []);

    const handleToggleStatus = async (moduleId, currentStatus) => {
        const adminData = JSON.parse(localStorage.getItem('admin') || '{}');
        const adminId = adminData.admin_id || (adminData.user && adminData.user.user_id);
        const newStatus = currentStatus === '1' ? '0' : '1';

        try {
            await api.put('/admin/modules/status', {
                admin_id: adminId,
                function_id: moduleId,
                status: newStatus
            });
            // Update local state instead of full refetch for better UX
            setModules(prev => prev.map(m =>
                m.function_id === moduleId ? { ...m, status: newStatus } : m
            ));
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update status");
        }
    };

    const handleHighlightModule = async (moduleId) => {
        try {
            await api.put('/admin/modules/highlight', {
                function_id: moduleId
            });
            // Update local state
            setModules(prev => prev.map(m => ({
                ...m,
                is_highlighted: m.function_id === moduleId ? '1' : '0'
            })));
        } catch (error) {
            console.error("Failed to highlight module", error);
            alert("Failed to update wizard module");
        }
    };

    const handlePriorityChange = (moduleId, val) => {
        setModules(prev => prev.map(m => m.function_id === moduleId ? { ...m, function_order: val } : m));
    };

    const savePriorities = async () => {
        try {
            const priorities = modules.map(m => ({ function_id: m.function_id, function_order: m.function_order || 0 }));
            await api.put('/admin/modules/priority', { priorities });
            alert("Priorities saved successfully");
            // Optional: Re-sort local state
            setModules(prev => [...prev].sort((a, b) => (parseInt(a.function_order) || 0) - (parseInt(b.function_order) || 0)));
        } catch (error) {
            console.error("Failed to save priorities", error);
            alert("Failed to save priorities");
        }
    };

    const handleDeleteModule = async (moduleId) => {
        if (window.confirm("Are you sure you want to delete this module? All associated fields and content will be lost.")) {
            try {
                await api.delete(`/admin/modules/${moduleId}`);
                setModules(prev => prev.filter(m => m.function_id !== moduleId));
            } catch (error) {
                console.error("Failed to delete module", error);
                alert("Failed to delete module");
            }
        }
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    Events / Modules
                </Typography>
                {isAdmin && (
                    <Box>
                        <Button
                            variant="outlined"
                            startIcon={<SaveIcon />}
                            onClick={savePriorities}
                            sx={{ mr: 2 }}
                        >
                            Save Priorities
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/modules/add')}
                        >
                            Add New Module
                        </Button>
                    </Box>
                )}
            </Box>

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            {isAdmin && <TableCell align="center">Priority</TableCell>}
                            <TableCell>Name</TableCell>
                            <TableCell>Org Name</TableCell>
                            <TableCell>Category</TableCell>
                            {isAdmin && <TableCell>Wizard/Highlight</TableCell>}
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {modules.map((row) => (
                            <TableRow
                                key={row.function_id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    {row.function_id}
                                </TableCell>
                                {isAdmin && (
                                    <TableCell align="center">
                                        <TextField
                                            type="number"
                                            size="small"
                                            variant="outlined"
                                            value={row.function_order || 0}
                                            onChange={(e) => handlePriorityChange(row.function_id, e.target.value)}
                                            style={{ width: '70px' }}
                                        />
                                    </TableCell>
                                )}
                                <TableCell>{row.function_name || '(No Name)'}</TableCell>
                                <TableCell>{row.function_org_name}</TableCell>
                                <TableCell>{row.category === '1' ? 'General' : 'Special'}</TableCell>
                                {isAdmin && (
                                    <TableCell>
                                        <Box display="flex" alignItems="center">
                                            <Radio
                                                checked={row.is_highlighted === '1'}
                                                onChange={() => handleHighlightModule(row.function_id)}
                                                color="primary"
                                                name="highlight-radio-buttons"
                                            />
                                            <Typography variant="caption" color="textSecondary">Top Card</Typography>
                                        </Box>
                                    </TableCell>
                                )}
                                <TableCell>
                                    <Box display="flex" alignItems="center">
                                        <Switch
                                            checked={row.status === '1'}
                                            onChange={() => handleToggleStatus(row.function_id, row.status)}
                                            color="success"
                                        />
                                        <Typography variant="body2" sx={{ ml: 1 }}>
                                            {row.status === '1' ? 'Active' : 'Inactive'}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    {!isAdmin && (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => navigate(`/cms/${row.function_id}`, { state: { moduleName: row.function_name } })}
                                            sx={{ mr: 1 }}
                                        >
                                            Content
                                        </Button>
                                    )}
                                    {isAdmin && (
                                        <>
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                size="small"
                                                startIcon={<SettingsIcon />}
                                                onClick={() => navigate(`/modules/fields/${row.function_id}`)}
                                                sx={{ mr: 1 }}
                                            >
                                                Fields
                                            </Button>
                                            <IconButton color="error" size="small" onClick={() => handleDeleteModule(row.function_id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </>
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

export default Modules;
