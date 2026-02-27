import React, { useEffect, useState } from 'react';
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
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    IconButton,
    DialogContentText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LockResetIcon from '@mui/icons-material/LockReset';
import api from '../api/axios';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);

    // Dialog states for Delete
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // Dialog states for Reset Password
    const [openResetDialog, setOpenResetDialog] = useState(false);
    const [userToReset, setUserToReset] = useState(null);
    const [newPassword, setNewPassword] = useState('');

    // Dialog states for Commission Rate
    const [openCommissionDialog, setOpenCommissionDialog] = useState(false);
    const [userToUpdateCommission, setUserToUpdateCommission] = useState(null);
    const [newCommissionRate, setNewCommissionRate] = useState('');

    const [formData, setFormData] = useState({
        user_name: '',
        password: '',
        name: '',
        email: '',
        app_id: ''
    });

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            if (response.data.success) {
                setUsers(response.data.users);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreate = async () => {
        try {
            await api.post('/admin/users', { ...formData, user_type: 2 }); // Default to App Admin
            setOpenDialog(false);
            setFormData({ user_name: '', password: '', name: '', email: '', app_id: '' });
            fetchUsers();
        } catch (error) {
            console.error("Failed to create user", error);
            alert("Failed to create user");
        }
    };

    const confirmDelete = (user) => {
        setUserToDelete(user);
        setOpenDeleteDialog(true);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;
        try {
            await api.delete(`/admin/users/${userToDelete.user_id}`);
            setOpenDeleteDialog(false);
            setUserToDelete(null);
            fetchUsers();
        } catch (error) {
            console.error("Failed to delete user", error);
            alert("Failed to delete user. Please try again.");
        }
    };

    const confirmReset = (user) => {
        setUserToReset(user);
        setNewPassword('');
        setOpenResetDialog(true);
    };

    const handleResetPassword = async () => {
        if (!newPassword) {
            alert('Please enter a new password');
            return;
        }
        try {
            await api.post(`/admin/users/${userToReset.user_id}/reset-password`, { new_password: newPassword });
            setOpenResetDialog(false);
            setUserToReset(null);
            alert("Password reset successfully!");
        } catch (error) {
            console.error("Failed to reset password", error);
            alert("Failed to reset password. Please try again.");
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    Users
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
                    Add New User
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Username</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Commission (%)</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((row) => (
                            <TableRow key={row.user_id}>
                                <TableCell>{row.user_id}</TableCell>
                                <TableCell>{row.user_name}</TableCell>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.email}</TableCell>
                                <TableCell>{row.commission_rate ? `${row.commission_rate}%` : '10.00%'}</TableCell>
                                <TableCell align="center">
                                    <IconButton color="secondary" onClick={() => {
                                        setUserToUpdateCommission(row);
                                        setNewCommissionRate(row.commission_rate || '10.00');
                                        setOpenCommissionDialog(true);
                                    }} title="Update Commission Rate">
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>%</Typography>
                                    </IconButton>
                                    <IconButton color="primary" onClick={() => confirmReset(row)} title="Reset Password">
                                        <LockResetIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => confirmDelete(row)} title="Delete User">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create User Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Add New User</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" name="user_name" label="Username" fullWidth value={formData.user_name} onChange={handleChange} />
                    <TextField margin="dense" name="password" label="Password" type="password" fullWidth value={formData.password} onChange={handleChange} />
                    <TextField margin="dense" name="name" label="Full Name" fullWidth value={formData.name} onChange={handleChange} />
                    <TextField margin="dense" name="email" label="Email" type="email" fullWidth value={formData.email} onChange={handleChange} />
                    <TextField margin="dense" name="app_id" label="App ID (Unique Identifier)" fullWidth value={formData.app_id} onChange={handleChange} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreate} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete user "{userToDelete?.name} ({userToDelete?.user_name})"? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>

            {/* Reset Password Dialog */}
            <Dialog open={openResetDialog} onClose={() => setOpenResetDialog(false)}>
                <DialogTitle>Reset Password</DialogTitle>
                <DialogContent>
                    <DialogContentText mb={2}>
                        Enter a new password for user "{userToReset?.name} ({userToReset?.user_name})".
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="New Password"
                        type="password"
                        fullWidth
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenResetDialog(false)}>Cancel</Button>
                    <Button onClick={handleResetPassword} color="primary" variant="contained">Reset</Button>
                </DialogActions>
            </Dialog>

            {/* Custom Commission Dialog */}
            <Dialog open={openCommissionDialog} onClose={() => setOpenCommissionDialog(false)}>
                <DialogTitle>Update Commission Rate</DialogTitle>
                <DialogContent>
                    <DialogContentText mb={2}>
                        Set the platform commission percentage for <strong>{userToUpdateCommission?.name}</strong>. The default rate is 10.00%. Note: Only values between 0 and 100 are permitted.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Commission Rate (%)"
                        type="number"
                        inputProps={{ step: "0.01", min: "0", max: "100" }}
                        fullWidth
                        value={newCommissionRate}
                        onChange={(e) => setNewCommissionRate(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCommissionDialog(false)}>Cancel</Button>
                    <Button
                        color="secondary"
                        variant="contained"
                        onClick={async () => {
                            if (!newCommissionRate || newCommissionRate < 0 || newCommissionRate > 100) {
                                alert('Please input a valid percentage rate between 0 and 100.');
                                return;
                            }
                            try {
                                await api.put(`/admin/users/${userToUpdateCommission.user_id}/commission`, { commission_rate: newCommissionRate });
                                setOpenCommissionDialog(false);
                                fetchUsers();
                            } catch (error) {
                                console.error('Failed to update commission rate', error);
                                alert('Failed to update commission rate.');
                            }
                        }}
                    >
                        Save Rate
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Users;
