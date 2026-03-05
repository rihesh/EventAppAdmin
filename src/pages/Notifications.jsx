import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Alert,
    CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import api from '../api/axios';

const Notifications = () => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [appId, setAppId] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Default API base URL or fallback to env var
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    const handleSend = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess('');
        setError('');

        if (!title.trim() || !body.trim()) {
            setError('Please enter both title and body for the notification.');
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/notifications/send', {
                title,
                body,
                app_id: appId.trim() || undefined
            });
            if (response.data.success) {
                setSuccess(`Notification sent to ${response.data.sent || 'all'} device(s)!`);
                setTitle('');
                setBody('');
            } else {
                setError(response.data.message || 'Failed to send notifications');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Error occurred while sending notifications');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, color: 'text.primary' }}>
                Push Notifications
            </Typography>

            <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 2, maxWidth: 600 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Send Broadcast Notification
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    This will send a push notification to all devices that have installed the app and granted notification permissions.
                </Typography>

                {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSend} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                        label="App ID (Optional)"
                        variant="outlined"
                        fullWidth
                        value={appId}
                        onChange={(e) => setAppId(e.target.value)}
                        placeholder="e.g. club-mobile-app"
                        helperText="Leave empty to send to all registered apps, or enter an App ID to target a specific app."
                        disabled={loading}
                    />

                    <TextField
                        label="Notification Title"
                        variant="outlined"
                        fullWidth
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. New Event Added!"
                        disabled={loading}
                    />

                    <TextField
                        label="Notification Body"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={4}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="e.g. Don't miss out on the upcoming tech conference..."
                        disabled={loading}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                        disabled={loading}
                        sx={{ mt: 2, alignSelf: 'flex-start', px: 4, py: 1.5, borderRadius: 2 }}
                    >
                        {loading ? 'Sending...' : 'Send Notification'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default Notifications;
