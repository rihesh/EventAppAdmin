import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Alert
} from '@mui/material';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const AddModule = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        function_name: '',
        description: '',
        status: '1',
        category: '0',
        date_filter: '0',
        visible_to: '1', // Default to 'Both' (1)
        multiple: '0',
        user_type: '0'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await api.post('/admin/modules/add', formData);
            if (response.data.success) {
                setSuccess('Module created successfully!');
                setTimeout(() => navigate('/modules'), 1500);
            } else {
                setError(response.data.message || 'Failed to create module');
            }
        } catch (err) {
            console.error(err);
            setError('Server error.');
        }
    };

    return (
        <Box maxWidth="800px" mx="auto" p={3}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    Add New Module
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Module Name *"
                        name="function_name"
                        value={formData.function_name}
                        onChange={handleChange}
                        margin="normal"
                        required
                        placeholder="Type original name..."
                    />

                    <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        margin="normal"
                        multiline
                        rows={3}
                        placeholder="Type your description..."
                    />

                    {/* Radio Groups */}
                    <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>

                        <FormControl>
                            <FormLabel>Status *</FormLabel>
                            <RadioGroup row name="status" value={formData.status} onChange={handleChange}>
                                <FormControlLabel value="0" control={<Radio />} label="Disabled" />
                                <FormControlLabel value="1" control={<Radio />} label="Enabled" />
                            </RadioGroup>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Category needed..? *</FormLabel>
                            <RadioGroup row name="category" value={formData.category} onChange={handleChange}>
                                <FormControlLabel value="0" control={<Radio />} label="No" />
                                <FormControlLabel value="1" control={<Radio />} label="Yes" />
                            </RadioGroup>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Date Filter Needed..? *</FormLabel>
                            <RadioGroup row name="date_filter" value={formData.date_filter} onChange={handleChange}>
                                <FormControlLabel value="0" control={<Radio />} label="Disabled" />
                                <FormControlLabel value="1" control={<Radio />} label="Enabled" />
                            </RadioGroup>
                        </FormControl>

                        {/* Visible To logic: 0=Api, 2=User, 1=Both */}
                        <FormControl>
                            <FormLabel>Visible to... *</FormLabel>
                            <RadioGroup row name="visible_to" value={formData.visible_to} onChange={handleChange}>
                                <FormControlLabel value="0" control={<Radio />} label="Only Api" />
                                <FormControlLabel value="2" control={<Radio />} label="Only User" />
                                <FormControlLabel value="1" control={<Radio />} label="Both Api and User" />
                            </RadioGroup>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Multiple...? *</FormLabel>
                            <RadioGroup row name="multiple" value={formData.multiple} onChange={handleChange}>
                                <FormControlLabel value="0" control={<Radio />} label="Disabled" />
                                <FormControlLabel value="1" control={<Radio />} label="Enabled" />
                            </RadioGroup>
                        </FormControl>

                        <FormControl>
                            <FormLabel>User Type needed...? *</FormLabel>
                            <RadioGroup row name="user_type" value={formData.user_type} onChange={handleChange}>
                                <FormControlLabel value="0" control={<Radio />} label="Disabled" />
                                <FormControlLabel value="1" control={<Radio />} label="Enabled" />
                            </RadioGroup>
                        </FormControl>

                    </Box>

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        sx={{ mt: 4 }}
                    >
                        Save
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default AddModule;
