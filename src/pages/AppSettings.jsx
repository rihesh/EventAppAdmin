import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Grid, Alert } from '@mui/material';
import api from '../api/axios';
import ColorPickerField from '../components/ColorPickerField';
import FileUpload from '../components/FileUpload';

const AppSettings = () => {
    const [settings, setSettings] = useState({
        primary_color: '#000000',
        secondary_color: '#ffffff',
        background_color: '#f5f5f5',
        text_color: '#000000',
        logo_url: '',
        event_name: '',
        subtitle: '',
        location: '',
        description: '',
        slider_images: [], // Managed as array
        social_links: { facebook: '', twitter: '', instagram: '', website: '' }
    });
    const [loading, setLoading] = useState(false);
    const [stripeStatus, setStripeStatus] = useState({ loading: true, connected: false });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const adminData = JSON.parse(localStorage.getItem('admin') || '{}');
            const userId = adminData.admin_id || (adminData.user && adminData.user.user_id) || 0;

            // Check Stripe Status
            api.get(`/stripe/status?user_id=${userId}`).then(res => {
                setStripeStatus({ loading: false, connected: res.data.connected });
            }).catch(err => {
                setStripeStatus({ loading: false, connected: false });
            });

            const response = await api.get(`/admin/settings?user_id=${userId}`);
            if (response.data.success && response.data.settings) {
                const fetched = response.data.settings;

                // Ensure slider_images is an array
                let sliderArr = [];
                if (Array.isArray(fetched.slider_images)) {
                    sliderArr = fetched.slider_images;
                } else if (typeof fetched.slider_images === 'string' && fetched.slider_images.trim() !== '') {
                    // Try to parse if it was saved as string previously
                    sliderArr = fetched.slider_images.split(',').map(s => s.trim()).filter(s => s);
                }

                // Ensure social_links is object
                let socialObj = fetched.social_links || { facebook: '', twitter: '', instagram: '', website: '' };
                if (typeof socialObj === 'string') {
                    try { socialObj = JSON.parse(socialObj); } catch (e) { }
                }

                setSettings({
                    ...fetched,
                    slider_images: sliderArr,
                    social_links: socialObj
                });
            }
        } catch (err) {
            console.error("Error fetching settings", err);
        }
    };

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleColorChange = (name, color) => {
        setSettings({ ...settings, [name]: color });
    };

    const handleSocialChange = (e) => {
        setSettings({
            ...settings,
            social_links: {
                ...settings.social_links,
                [e.target.name]: e.target.value
            }
        });
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage('');
        setError('');
        try {
            const adminData = JSON.parse(localStorage.getItem('admin') || '{}');
            const userId = adminData.admin_id || (adminData.user && adminData.user.user_id) || 0;

            await api.post('/admin/settings', {
                ...settings,
                user_id: userId
            });
            setMessage('Settings saved successfully!');
        } catch (err) {
            setError('Failed to save settings.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStripeConnect = async () => {
        try {
            const adminData = JSON.parse(localStorage.getItem('admin') || '{}');
            const userId = adminData.admin_id || (adminData.user && adminData.user.user_id) || 0;
            const response = await api.post('/stripe/onboard', { user_id: userId });
            if (response.data.url) {
                window.location.href = response.data.url;
            }
        } catch (err) {
            setError('Failed to initiate Stripe onboarding.');
            console.error(err);
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>App Settings</Typography>

            {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Paper sx={{ p: 4, maxWidth: 800 }}>
                <Grid container spacing={4}>
                    {/* Theme Section */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2 }}>
                            Theme & Branding
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={6}>
                                <ColorPickerField
                                    label="Primary Color"
                                    color={settings.primary_color || '#000000'}
                                    onChange={(color) => handleColorChange('primary_color', color)}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <ColorPickerField
                                    label="Secondary Color"
                                    color={settings.secondary_color || '#ffffff'}
                                    onChange={(color) => handleColorChange('secondary_color', color)}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <ColorPickerField
                                    label="Background Color"
                                    color={settings.background_color || '#f5f5f5'}
                                    onChange={(color) => handleColorChange('background_color', color)}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <ColorPickerField
                                    label="Text Color"
                                    color={settings.text_color || '#000000'}
                                    onChange={(color) => handleColorChange('text_color', color)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FileUpload
                                    label="Logo Image"
                                    value={settings.logo_url}
                                    onChange={(url) => setSettings({ ...settings, logo_url: url })}
                                />
                                {/* Fallback text input if needed, or just rely on FileUpload showing preview */}
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Event Details Section */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2 }}>
                            Event / Host Profile
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Event / Club Name" fullWidth name="event_name" value={settings.event_name || ''} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Subtitle / Tagline" fullWidth name="subtitle" value={settings.subtitle || ''} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField label="Location" fullWidth name="location" value={settings.location || ''} onChange={handleChange} helperText="e.g., Los Angeles, CA" />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField label="Description" fullWidth multiline rows={4} name="description" value={settings.description || ''} onChange={handleChange} helperText="About the host or event" />
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Media Section */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2 }}>
                            Media
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <FileUpload
                                    label="Slider Images"
                                    multiple
                                    value={settings.slider_images}
                                    onChange={(urls) => setSettings({ ...settings, slider_images: urls })}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Social Media Section */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2 }}>
                            Social Media
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={6}>
                                <TextField label="Facebook URL" fullWidth name="facebook" value={settings.social_links?.facebook || ''} onChange={handleSocialChange} />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField label="Twitter / X URL" fullWidth name="twitter" value={settings.social_links?.twitter || ''} onChange={handleSocialChange} />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField label="Instagram URL" fullWidth name="instagram" value={settings.social_links?.instagram || ''} onChange={handleSocialChange} />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField label="Website URL" fullWidth name="website" value={settings.social_links?.website || ''} onChange={handleSocialChange} />
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Payments & Stripe Section */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2 }}>
                            Ticketing & Payouts (Stripe)
                        </Typography>
                        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                To sell tickets and receive payouts directly to your bank account, you must connect a Stripe account.
                            </Typography>
                            {stripeStatus.loading ? (
                                <Typography variant="body2" color="textSecondary">Checking Stripe status...</Typography>
                            ) : stripeStatus.connected ? (
                                <Alert severity="success" sx={{ mb: 2 }}>
                                    Your Stripe account is successfully connected and ready to receive payouts!
                                </Alert>
                            ) : (
                                <Button
                                    variant="contained"
                                    onClick={handleStripeConnect}
                                    sx={{ bgcolor: '#635BFF', '&:hover': { bgcolor: '#4A41E0' } }}
                                >
                                    Connect Stripe Account
                                </Button>
                            )}
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Button variant="contained" color="primary" size="large" onClick={handleSave} disabled={loading} sx={{ minWidth: 200 }}>
                            {loading ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default AppSettings;
