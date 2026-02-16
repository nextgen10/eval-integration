'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Rating, Snackbar, Alert, Card, CardContent, Divider, alpha } from '@mui/material';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import SendIcon from '@mui/icons-material/Send';
import StarIcon from '@mui/icons-material/Star';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { API_BASE_URL } from '../utils/config';
import { useSidebar } from '../contexts/SidebarContext';

interface Feedback {
    id: number;
    timestamp: string;
    rating: number;
    suggestion: string;
}

export default function FeedbackPage() {
    const { sidebarWidth } = useSidebar();
    const [rating, setRating] = useState<number | null>(0);
    const [suggestion, setSuggestion] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    const [loading, setLoading] = useState(false);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

    const fetchFeedback = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/feedback`);
            if (res.ok) {
                const data = await res.json();
                setFeedbacks(data);
            }
        } catch (error) {
            console.error("Failed to fetch feedback", error);
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, []);

    const handleSubmit = async () => {
        if (!rating) {
            setSnackbarMessage("Please provide a rating.");
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, suggestion })
            });

            if (!response.ok) {
                throw new Error("Failed to submit feedback");
            }

            setSnackbarMessage("Thank you for your feedback!");
            setSnackbarSeverity("success");
            setOpenSnackbar(true);
            setRating(0);
            setSuggestion('');
            fetchFeedback(); // Refresh list
        } catch (error: any) {
            setSnackbarMessage(error.message);
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, ml: `${sidebarWidth}px`, transition: 'margin-left 0.3s ease-in-out' }}>
                <Box sx={{ position: 'sticky', top: 0, zIndex: 1200, p: 2, height: '70px', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: (theme) => alpha(theme.palette.background.paper, 0.7), backdropFilter: 'blur(10px)' }}>
                    <Box sx={{ pt: 1 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            Feedback
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            We value your input!
                        </Typography>
                    </Box>
                    <ThemeToggle />
                </Box>

                <Grid container spacing={2} sx={{ px: 2, py: 2, pb: 10 }}>
                    {/* Feedback Form */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                Submit Feedback
                            </Typography>
                            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Box>
                                    <Typography component="legend">Rate your experience</Typography>
                                    <Rating
                                        name="simple-controlled"
                                        value={rating}
                                        onChange={(event, newValue) => {
                                            setRating(newValue);
                                        }}
                                        size="large"
                                    />
                                </Box>
                                <TextField
                                    label="Suggestions / Comments"
                                    multiline
                                    rows={4}
                                    value={suggestion}
                                    onChange={(e) => setSuggestion(e.target.value)}
                                    placeholder="Tell us what you think..."
                                    fullWidth
                                    variant="outlined"
                                />
                                <Button
                                    variant="outlined"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    startIcon={<SendIcon />}
                                    sx={{ alignSelf: 'flex-start' }}
                                >
                                    {loading ? "Submitting..." : "Submit"}
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Admin View: Recent Feedback */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', height: '100%', maxHeight: 'calc(100vh - 150px)', overflow: 'auto' }}>
                            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                                Recent Feedback (Admin View)
                            </Typography>
                            {feedbacks.length === 0 ? (
                                <Typography color="text.secondary" fontStyle="italic">No feedback yet.</Typography>
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {feedbacks.map((fb) => (
                                        <Card key={fb.id} variant="outlined">
                                            <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                    <Rating value={fb.rating} readOnly size="small" />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(fb.timestamp).toLocaleString()}
                                                    </Typography>
                                                </Box>
                                                {fb.suggestion && (
                                                    <Typography variant="body2" color="text.primary">
                                                        "{fb.suggestion}"
                                                    </Typography>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>

                <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
                    <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Box>
        </Box>
    );
}
