import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    LinearProgress,
    IconButton,
    MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { Tooltip } from '@mui/material';
import api from '../api/axios';
import FileUpload from '../components/FileUpload';

const CMS = () => {
    const { function_id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [structure, setStructure] = useState([]);
    const [content, setContent] = useState([]);

    // Edit Mode State
    const [openDialog, setOpenDialog] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, [function_id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const adminData = JSON.parse(localStorage.getItem('admin') || '{}');
            const adminId = adminData.admin_id || (adminData.user && adminData.user.user_id) || 0;

            const [structRes, contentRes] = await Promise.all([
                api.get(`/cms/structure/${function_id}`),
                api.get(`/cms/content/${function_id}`, { params: { user_id: adminId } })
            ]);
            setStructure(structRes.data.fields || []);
            setContent(contentRes.data.content || []);
        } catch (error) {
            console.error("Error loading CMS data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (item) => {
        try {
            if (item) {
                const adminData = JSON.parse(localStorage.getItem('admin') || '{}');
                const adminId = adminData.admin_id || (adminData.user && adminData.user.user_id) || 0;

                // Fetch full item details including dynamic values
                const res = await api.get(`/cms/content/${function_id}/${item.function_allot_id}`, { params: { user_id: adminId } });
                setCurrentItem(res.data.item);

                // Merge basic fields and dynamic values into one form object
                setFormData({
                    ...res.data.item,
                    ...Object.entries(res.data.values).reduce((acc, [k, v]) => ({ ...acc, [`field_${k}`]: v }), {})
                });
            } else {
                // New Item
                setCurrentItem({}); // Empty means new
                setFormData({});
            }
            setOpenDialog(true);
        } catch (error) {
            console.error("Error fetching item details", error);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const adminData = JSON.parse(localStorage.getItem('admin') || '{}');
            const adminId = adminData.admin_id || (adminData.user && adminData.user.user_id) || 0;

            await api.post(`/cms/content/${function_id}`, {
                ...formData,
                id: currentItem.function_allot_id, // undefined if new
                user_id: adminId
            });
            setOpenDialog(false);
            fetchData(); // Refresh list
        } catch (error) {
            console.error("Error saving content", error);
            alert("Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                const adminData = JSON.parse(localStorage.getItem('admin') || '{}');
                const adminId = adminData.admin_id || (adminData.user && adminData.user.user_id) || 0;

                await api.delete(`/cms/content/${function_id}/${id}`, { params: { user_id: adminId } });
                fetchData();
            } catch (error) {
                console.error("Error deleting content", error);
                alert("Failed to delete. You might not have permission.");
            }
        }
    };

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    // Helper to render dynamic input based on field_type_id
    const renderInput = (field) => {
        const key = `field_${field.function_field_id}`;
        const label = field.name;
        const value = formData[key] || '';
        const typeId = field.field_type_id;

        // 1: Textbox, 2: Textarea, 11: File, 12: Date, 13: Time

        if (typeId === 2) {
            return (
                <TextField
                    key={key}
                    fullWidth
                    margin="dense"
                    label={label}
                    multiline
                    rows={4}
                    value={value}
                    onChange={(e) => handleChange(key, e.target.value)}
                />
            );
        }

        if (typeId === 11) { // File Upload
            let fileValue = value;
            let isMultiple = false;

            // Check if value is JSON array (for Gallery)
            try {
                if (typeof value === 'string' && (value.startsWith('[') || value.includes('","'))) {
                    const parsed = JSON.parse(value);
                    if (Array.isArray(parsed)) {
                        fileValue = parsed;
                        isMultiple = true;
                    }
                }
            } catch (e) { }

            // Force multiple for known Gallery Image field (ID 116)
            if (field.function_field_id === 116) isMultiple = true;

            return (
                <FileUpload
                    key={key}
                    label={label}
                    value={fileValue}
                    multiple={isMultiple}
                    onChange={(v) => handleChange(key, isMultiple ? JSON.stringify(v) : v)}
                    allowUrl={true}
                />
            );
        }

        if (typeId === 12) { // Date
            return (
                <TextField
                    key={key}
                    fullWidth
                    margin="dense"
                    label={label}
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={value}
                    onChange={(e) => handleChange(key, e.target.value)}
                />
            );
        }

        if (typeId === 13) { // Time
            return (
                <TextField
                    key={key}
                    fullWidth
                    margin="dense"
                    label={label}
                    type="time"
                    InputLabelProps={{ shrink: true }}
                    value={value}
                    onChange={(e) => handleChange(key, e.target.value)}
                />
            );
        }

        if (typeId === 7) { // Dropdown
            // Parse options, which is a comma separated string usually e.g. "Yes,No"
            let options = [];
            if (field.options && typeof field.options === 'string' && field.options.trim() !== '') {
                options = field.options.split(',');
            }
            return (
                <TextField
                    key={key}
                    select
                    fullWidth
                    margin="dense"
                    label={label}
                    value={value || ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                >
                    {options.map((opt, idx) => (
                        <MenuItem key={idx} value={opt.trim()}>
                            {opt.trim()}
                        </MenuItem>
                    ))}
                </TextField>
            );
        }

        // Default Text
        return (
            <TextField
                key={key}
                fullWidth
                margin="dense"
                label={label}
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
            />
        );
    };

    if (loading) return <LinearProgress />;

    return (
        <Box p={3}>
            <Box display="flex" alignItems="center" mb={3}>
                <IconButton onClick={() => navigate('/modules')} sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ flexGrow: 1 }}>
                    Manage Content
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleEdit(null)}
                >
                    Add New
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Order</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {content.map((row) => (
                            <TableRow key={row.function_allot_id}>
                                <TableCell>{row.function_allot_id}</TableCell>
                                <TableCell>{row.title}</TableCell>
                                <TableCell>{row.sort_order}</TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Configure Tickets & Seats">
                                        <IconButton
                                            onClick={() => navigate(`/tickets/${row.function_allot_id}`)}
                                            color="secondary"
                                            size="small"
                                        >
                                            <ConfirmationNumberIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <IconButton onClick={() => handleEdit(row)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(row.function_allot_id)} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {content.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">No content found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Edit/Create Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>{currentItem && currentItem.function_allot_id ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                <DialogContent dividers>
                    {/* Basic Fields */}
                    <Typography variant="subtitle2" color="primary" sx={{ mt: 2, mb: 1 }}>Basic Details</Typography>
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Title"
                        value={formData.title || ''}
                        onChange={(e) => handleChange('title', e.target.value)}
                    />
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Sort Order"
                        type="number"
                        value={formData.sort_order || 0}
                        onChange={(e) => handleChange('sort_order', e.target.value)}
                    />

                    <Box mt={2} mb={2}>
                        <FileUpload
                            label="Main Image"
                            value={formData.image || ''}
                            onChange={(url) => handleChange('image', url)}
                            allowUrl={true}
                        />
                    </Box>

                    {/* Dynamic Fields */}
                    {structure.length > 0 && (
                        <>
                            <Typography variant="subtitle2" color="primary" sx={{ mt: 3, mb: 1 }}>Module Fields</Typography>
                            {structure.map(field => renderInput(field))}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained" disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CMS;
