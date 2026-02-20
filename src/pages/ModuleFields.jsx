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
    IconButton,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Checkbox,
    FormControlLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../api/axios';

const ModuleFields = () => {
    const { function_id } = useParams();
    const navigate = useNavigate();

    const [fields, setFields] = useState([]);
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Dialog State
    const [open, setOpen] = useState(false);
    const [newField, setNewField] = useState({
        name: '',
        field_type_id: '',
        instructions: '',
        required: false,
        module_values: false,
        options: '' // For select types
    });

    useEffect(() => {
        fetchData();
    }, [function_id]);

    const fetchData = async () => {
        try {
            const [fieldsRes, typesRes] = await Promise.all([
                api.get(`/cms/structure/${function_id}`), // Reusing existing structure endpoint
                api.get('/admin/field-types')
            ]);
            setFields(fieldsRes.data.fields || []);
            setTypes(typesRes.data.types || []);
        } catch (error) {
            console.error("Error loading data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddField = async () => {
        try {
            await api.post(`/admin/fields/${function_id}`, {
                ...newField,
                required: newField.required ? '1' : '0',
                module_values: newField.module_values ? '1' : '0'
            });
            setOpen(false);
            setNewField({ name: '', field_type_id: '', instructions: '', required: false, module_values: false, options: '' });
            fetchData(); // Refresh
        } catch (error) {
            console.error("Failed to add field", error);
            alert("Failed to add field");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await api.delete(`/admin/fields/${id}`);
            fetchData();
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    const getTypeName = (id) => {
        const t = types.find(t => t.field_type_id === id);
        return t ? t.field_name : id;
    };

    return (
        <Box p={3}>
            <Box display="flex" alignItems="center" mb={3}>
                <IconButton onClick={() => navigate('/modules')} sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ flexGrow: 1 }}>
                    Edit Fields
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpen(true)}
                >
                    Add Field
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Field Name</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Mandatory</TableCell>
                            <TableCell>Module Values</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fields.map((field) => (
                            <TableRow key={field.function_field_id}>
                                <TableCell>
                                    <Typography variant="subtitle1">{field.name}</Typography>
                                    <Typography variant="caption" color="textSecondary">{field.instructions}</Typography>
                                </TableCell>
                                <TableCell>{getTypeName(field.field_type_id)}</TableCell>
                                <TableCell>
                                    <Checkbox checked={field.required === '1'} disabled />
                                </TableCell>
                                <TableCell>
                                    <Checkbox checked={field.module_values === '1'} disabled />
                                </TableCell>
                                <TableCell align="right">
                                    <Button
                                        color="error"
                                        variant="contained"
                                        size="small"
                                        onClick={() => handleDelete(field.function_field_id)}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add Field Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add New Field</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        fullWidth
                        label="Field Name"
                        margin="dense"
                        value={newField.name}
                        onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                    />

                    <TextField
                        select
                        fullWidth
                        label="Type"
                        margin="dense"
                        value={newField.field_type_id}
                        onChange={(e) => setNewField({ ...newField, field_type_id: e.target.value })}
                    >
                        {types.map((type) => (
                            <MenuItem key={type.field_type_id} value={type.field_type_id}>
                                {type.field_name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        fullWidth
                        label="Instructions / Placeholder"
                        margin="dense"
                        multiline
                        rows={2}
                        value={newField.instructions}
                        onChange={(e) => setNewField({ ...newField, instructions: e.target.value })}
                    />

                    <Box mt={2}>
                        <FormControlLabel
                            control={<Checkbox checked={newField.required} onChange={(e) => setNewField({ ...newField, required: e.target.checked })} />}
                            label="Mandatory"
                        />
                        <FormControlLabel
                            control={<Checkbox checked={newField.module_values} onChange={(e) => setNewField({ ...newField, module_values: e.target.checked })} />}
                            label="Module Values"
                        />
                    </Box>

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddField} variant="contained">Add</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ModuleFields;
