import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import api from '../api/axios';

const ModuleAllotment = () => {
    const [allotments, setAllotments] = useState([]);
    const [users, setUsers] = useState([]);
    const [modules, setModules] = useState([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        user_id: '',
        function_id: '',
        name: '' // Optional override name
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [allotResponse, usersResponse, modulesResponse] = await Promise.all([
                api.get('/admin/allotments'),
                api.get('/admin/users'),
                api.get('/admin/modules', { params: { is_super: '1' } })
            ]);

            if (allotResponse.data.success) {
                const fetchedAllotments = allotResponse.data.allotments;
                const fetchedUsers = usersResponse.data.success ? usersResponse.data.users : [];
                const fetchedModules = modulesResponse.data.success ? modulesResponse.data.modules : [];

                // Map IDs to names manually if associations failed or are incomplete
                const mappedAllotments = fetchedAllotments.map(item => ({
                    ...item,
                    User: item.User || fetchedUsers.find(u => u.user_id === item.user_id),
                    Function: item.Function || fetchedModules.find(m => m.function_id === item.function_id)
                }));

                setAllotments(mappedAllotments);
                setUsers(fetchedUsers);
                setModules(fetchedModules);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // Remove separate fetchOptions since we do it all in one go now to ensure mapping works
    // const fetchOptions = ...

    const handleSave = async () => {
        try {
            if (!formData.user_id || !formData.function_id) {
                setError('User and Module are required');
                return;
            }
            const response = await api.post('/admin/allotments', formData);
            if (response.data.success) {
                setOpen(false);
                setFormData({ user_id: '', function_id: '', name: '' });
                fetchData();
                setError('');
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Error saving allotment');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this allotment?')) {
            try {
                await api.delete(`/admin/allotments/${id}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting allotment:', error);
            }
        }
    };

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    Module Allotment
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpen(true)}
                >
                    Allot Module
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>User</TableCell>
                            <TableCell>Module (Original Name)</TableCell>
                            <TableCell>Display Name</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {allotments.map((row) => (
                            <TableRow key={row.functions_user_id}>
                                <TableCell>{row.User?.name || 'Unknown User'}</TableCell>
                                <TableCell>{row.Function?.function_name || 'Unknown Module'}</TableCell>
                                <TableCell>{row.name || row.Function?.function_name}</TableCell>
                                <TableCell align="right">
                                    <Button
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                        onClick={() => handleDelete(row.functions_user_id)}
                                    >
                                        Remove
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {allotments.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">No modules allotted yet</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Allot Module to User</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}

                    <TextField
                        select
                        label="Select User"
                        fullWidth
                        margin="normal"
                        value={formData.user_id}
                        onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    >
                        {users.map((user) => (
                            <MenuItem key={user.user_id} value={user.user_id}>
                                {user.name} ({user.user_name})
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Select Module"
                        fullWidth
                        margin="normal"
                        value={formData.function_id}
                        onChange={(e) => setFormData({ ...formData, function_id: e.target.value })}
                    >
                        {modules.map((mod) => (
                            <MenuItem key={mod.function_id} value={mod.function_id}>
                                {mod.function_name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Display Name (Optional)"
                        fullWidth
                        margin="normal"
                        helperText="Override the module name for this user (e.g. 'My Agenda')"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained">Allot</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ModuleAllotment;
