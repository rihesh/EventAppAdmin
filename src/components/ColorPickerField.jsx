import React, { useState } from 'react';
import { Box, Typography, Popover } from '@mui/material';
import { SketchPicker } from 'react-color';

const ColorPickerField = ({ label, color, onChange }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 0.5 }}>
                {label}
            </Typography>
            <Box
                onClick={handleClick}
                sx={{
                    p: 0.5,
                    background: '#fff',
                    borderRadius: 1,
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
                    display: 'inline-block',
                    cursor: 'pointer',
                }}
            >
                <Box
                    sx={{
                        width: 36,
                        height: 14,
                        borderRadius: 0.5,
                        background: color,
                    }}
                />
            </Box>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <SketchPicker
                    color={color}
                    onChange={(c) => onChange(c.hex)}
                />
            </Popover>
        </Box>
    );
};

export default ColorPickerField;
