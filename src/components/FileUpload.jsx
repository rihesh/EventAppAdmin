import React, { useState } from 'react';
import { Box, Button, CircularProgress, Typography, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../api/axios'; // Make sure this points to your axios instance

const FileUpload = ({ value, onChange, label, multiple = false }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setLoading(true);
        setError('');
        const newUrls = [];
        let hasError = false;

        try {
            // Upload each file sequentially
            for (let i = 0; i < files.length; i++) {
                const formData = new FormData();
                formData.append('file', files[i]);

                try {
                    const response = await api.post('/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });

                    if (response.data.success) {
                        newUrls.push(response.data.file.url);
                    } else {
                        console.error('Upload failed for file:', files[i].name, response.data.message);
                        hasError = true;
                    }
                } catch (uploadErr) {
                    console.error('Upload error for file:', files[i].name, uploadErr);
                    hasError = true;
                }
            }

            if (newUrls.length > 0) {
                if (multiple) {
                    const currentUrls = value ? (Array.isArray(value) ? value : [value]) : [];
                    onChange([...currentUrls, ...newUrls]);
                } else {
                    onChange(newUrls[0]);
                }
            }

            if (hasError) {
                setError('Some files failed to upload. Check console for details.');
            }

        } catch (err) {
            console.error("General upload error:", err);
            setError('Failed to initiate upload');
        } finally {
            setLoading(false);
            // Reset file input to allow selecting same file again
            if (e.target) e.target.value = '';
        }
    };

    const handleRemove = (indexForMultiple) => {
        if (multiple) {
            const newUrls = [...value];
            newUrls.splice(indexForMultiple, 1);
            onChange(newUrls);
        } else {
            onChange('');
        }
    };

    // Render Preview
    const renderPreview = (url, index = null) => {
        if (!url) return null;
        return (
            <Box key={index} sx={{ position: 'relative', display: 'inline-block', mr: 2, mb: 2, border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
                <img src={url} alt="Uploaded" style={{ height: 100, width: 'auto', display: 'block' }} />
                <IconButton
                    size="small"
                    sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(255,255,255,0.7)' }}
                    onClick={() => handleRemove(index)}
                >
                    <DeleteIcon fontSize="small" color="error" />
                </IconButton>
            </Box>
        );
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>{label}</Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {multiple && Array.isArray(value) && value.map((url, idx) => renderPreview(url, idx))}
                {!multiple && value && renderPreview(value)}

                {/* Upload Button */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 100, height: 100, border: '2px dashed #ccc', borderRadius: 1, cursor: 'pointer', '&:hover': { borderColor: '#1976d2' } }} component="label">
                    <input type="file" hidden multiple={multiple} accept="image/*,video/*" onChange={handleFileChange} />
                    {loading ? <CircularProgress size={24} /> : <CloudUploadIcon color="action" />}
                </Box>
            </Box>
            {error && <Typography color="error" variant="caption">{error}</Typography>}
        </Box>
    );
};

export default FileUpload;
