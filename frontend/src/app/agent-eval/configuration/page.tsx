'use client';
import React, { useState } from 'react';
import {
    Box, Typography, Paper, TextField, Button, Grid,
    Snackbar, Tooltip, InputAdornment
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function ConfigurationPage() {
    const [openSnackbar, setOpenSnackbar] = useState(false);

    // Standard Metrics State (existing configuration)
    const [semanticThreshold, setSemanticThreshold] = useState('0.72');
    const [alpha, setAlpha] = useState('0.6');
    const [beta, setBeta] = useState('0.2');
    const [gamma, setGamma] = useState('0.2');
    const [enableSafety, setEnableSafety] = useState(true);
    const [modelName, setModelName] = useState('all-MiniLM-L12-v2');
    const [llmModelName, setLlmModelName] = useState('gpt-4o');
    const [llmThreshold, setLlmThreshold] = useState('0.75');
    const [accuracyThreshold, setAccuracyThreshold] = useState('0.5');
    const [consistencyThreshold, setConsistencyThreshold] = useState('0.5');
    const [hallucinationThreshold, setHallucinationThreshold] = useState('0.5');
    const [rqsThreshold, setRqsThreshold] = useState('0.5');
    const [fuzzyThreshold, setFuzzyThreshold] = useState('0.85');
    const [shortTextLength, setShortTextLength] = useState('40');

    // JSON Weights
    const [wAccuracy, setWAccuracy] = useState('0.45');
    const [wCompleteness, setWCompleteness] = useState('0.25');
    const [wHallucination, setWHallucination] = useState('0.15');
    const [wSafety, setWSafety] = useState('0.15');

    const handleSave = () => {
        // Save standard metrics
        localStorage.setItem('config_semantic_threshold', semanticThreshold);
        localStorage.setItem('config_alpha', alpha);
        localStorage.setItem('config_beta', beta);
        localStorage.setItem('config_gamma', gamma);
        localStorage.setItem('config_enable_safety', 'true');
        localStorage.setItem('config_model_name', modelName);
        localStorage.setItem('config_llm_model_name', llmModelName);
        localStorage.setItem('config_llm_threshold', llmThreshold);
        localStorage.setItem('config_accuracy_threshold', accuracyThreshold);
        localStorage.setItem('config_consistency_threshold', consistencyThreshold);
        localStorage.setItem('config_hallucination_threshold', hallucinationThreshold);
        localStorage.setItem('config_rqs_threshold', rqsThreshold);
        localStorage.setItem('config_fuzzy_threshold', fuzzyThreshold);
        localStorage.setItem('config_short_text_length', shortTextLength);
        localStorage.setItem('config_w_accuracy', wAccuracy);
        localStorage.setItem('config_w_completeness', wCompleteness);
        localStorage.setItem('config_w_hallucination', wHallucination);
        localStorage.setItem('config_w_safety', wSafety);

        console.log("Saving configuration to localStorage");
        setOpenSnackbar(true);
    };

    // Load settings on mount
    React.useEffect(() => {
        // Load standard metrics
        setSemanticThreshold(localStorage.getItem('config_semantic_threshold') || '0.72');
        setAlpha(localStorage.getItem('config_alpha') || '0.6');
        setBeta(localStorage.getItem('config_beta') || '0.2');
        setGamma(localStorage.getItem('config_gamma') || '0.2');
        setEnableSafety(true);
        setModelName(localStorage.getItem('config_model_name') || 'all-MiniLM-L12-v2');
        setLlmModelName(localStorage.getItem('config_llm_model_name') || 'gpt-4o');
        setLlmThreshold(localStorage.getItem('config_llm_threshold') || '0.75');
        setAccuracyThreshold(localStorage.getItem('config_accuracy_threshold') || '0.5');
        setConsistencyThreshold(localStorage.getItem('config_consistency_threshold') || '0.5');
        setHallucinationThreshold(localStorage.getItem('config_hallucination_threshold') || '0.5');
        setRqsThreshold(localStorage.getItem('config_rqs_threshold') || '0.5');
        setFuzzyThreshold(localStorage.getItem('config_fuzzy_threshold') || '0.85');
        setShortTextLength(localStorage.getItem('config_short_text_length') || '40');
        setWAccuracy(localStorage.getItem('config_w_accuracy') || '0.45');
        setWCompleteness(localStorage.getItem('config_w_completeness') || '0.25');
        setWHallucination(localStorage.getItem('config_w_hallucination') || '0.15');
        setWSafety(localStorage.getItem('config_w_safety') || '0.15');
    }, []);

    const InfoIconWithHover = (props: any) => (
        <InfoOutlinedIcon
            {...props}
            sx={{
                color: theme => theme.palette.text.disabled,
                cursor: 'pointer',
                fontSize: 'medium',
                ...props.sx
            }}
        />
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* Header */}
            <Box sx={{ p: 2, height: '70px', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.paper' }}>
                <Box sx={{ pt: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        Configuration
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        System Settings & Parameters
                    </Typography>
                </Box>
            </Box>

            {/* Content */}
            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, pb: 5 }}>
                <Grid container spacing={2}>
                    {/* Left Column - Thresholds */}
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="h6" gutterBottom sx={{ fontSize: '0.9rem', mb: 1.5 }}>
                                Evaluation Thresholds
                            </Typography>
                            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontSize: '0.85rem', color: '#2196f3' }}>
                                Basic Thresholds
                            </Typography>

                            <Grid container spacing={2.5}>
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Semantic Threshold"
                                        type="number"
                                        value={semanticThreshold}
                                        onChange={(e) => setSemanticThreshold(e.target.value)}
                                        inputProps={{ step: "0.01", min: "0", max: "1" }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Tooltip title="Minimum similarity score required for semantic matching (0-1)" arrow>
                                                        <InfoIconWithHover />
                                                    </Tooltip>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                            </Grid>

                            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontSize: '0.85rem', color: '#2196f3' }}>
                                Status Thresholds
                            </Typography>
                            <Grid container spacing={2.5}>
                                <Grid size={{ xs: 6 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Min Accuracy"
                                        type="number"
                                        value={accuracyThreshold}
                                        onChange={(e) => setAccuracyThreshold(e.target.value)}
                                        inputProps={{ step: "0.01", min: "0", max: "1" }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Tooltip title="Minimum acceptable accuracy score (0-1)" arrow>
                                                        <InfoIconWithHover />
                                                    </Tooltip>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Min Consistency"
                                        type="number"
                                        value={consistencyThreshold}
                                        onChange={(e) => setConsistencyThreshold(e.target.value)}
                                        inputProps={{ step: "0.01", min: "0", max: "1" }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Tooltip title="Minimum acceptable consistency score (0-1)" arrow>
                                                        <InfoIconWithHover />
                                                    </Tooltip>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Max Hallucination"
                                        type="number"
                                        value={hallucinationThreshold}
                                        onChange={(e) => setHallucinationThreshold(e.target.value)}
                                        inputProps={{ step: "0.01", min: "0", max: "1" }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Tooltip title="Maximum acceptable hallucination rate (0-1)" arrow>
                                                        <InfoIconWithHover />
                                                    </Tooltip>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Min RQS"
                                        type="number"
                                        value={rqsThreshold}
                                        onChange={(e) => setRqsThreshold(e.target.value)}
                                        inputProps={{ step: "0.01", min: "0", max: "1" }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Tooltip title="Minimum Response Quality Score (RQS) required to pass (0-1)" arrow>
                                                        <InfoIconWithHover />
                                                    </Tooltip>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                            </Grid>

                            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontSize: '0.85rem', color: '#2196f3' }}>
                                RQS Weights
                            </Typography>
                            <Grid container spacing={2.5}>
                                <Grid size={{ xs: 4 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Alpha"
                                        type="number"
                                        value={alpha}
                                        onChange={(e) => setAlpha(e.target.value)}
                                        inputProps={{ step: "0.1", min: "0", max: "1" }}
                                        helperText="Accuracy Weight"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Tooltip title="Weight for Accuracy in RQS calculation (0-1). Alpha + Beta + Gamma should sum to 1." arrow>
                                                        <InfoIconWithHover />
                                                    </Tooltip>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 4 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Beta"
                                        type="number"
                                        value={beta}
                                        onChange={(e) => setBeta(e.target.value)}
                                        inputProps={{ step: "0.1", min: "0", max: "1" }}
                                        helperText="Consistency Weight"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Tooltip title="Weight for Consistency in RQS calculation (0-1). Alpha + Beta + Gamma should sum to 1." arrow>
                                                        <InfoIconWithHover />
                                                    </Tooltip>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 4 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Gamma"
                                        type="number"
                                        value={gamma}
                                        onChange={(e) => setGamma(e.target.value)}
                                        inputProps={{ step: "0.1", min: "0", max: "1" }}
                                        helperText="Correctness Weight"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Tooltip title="Weight for Strict Correctness in RQS calculation (0-1). Alpha + Beta + Gamma should sum to 1." arrow>
                                                        <InfoIconWithHover />
                                                    </Tooltip>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Right Column - Models & Settings */}
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="h6" gutterBottom sx={{ fontSize: '0.9rem', mb: 1.5 }}>
                                Models & Paths
                            </Typography>

                            <TextField
                                fullWidth
                                size="small"
                                label="Embedding Model"
                                value={modelName}
                                onChange={(e) => setModelName(e.target.value)}
                                sx={{ mb: 2.5 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Tooltip title="Model name used for generating text embeddings (e.g., all-MiniLM-L12-v2)" arrow>
                                                <InfoIconWithHover />
                                            </Tooltip>
                                        </InputAdornment>
                                    )
                                }}
                            />

                            <Typography variant="subtitle2" sx={{ mt: 1, mb: 1, fontSize: '0.85rem', color: '#2196f3' }}>
                                Safety & Quality Assessment
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                label="Safety Judge Model"
                                value={llmModelName}
                                onChange={(e) => setLlmModelName(e.target.value)}
                                sx={{ mt: 1, mb: 2.5 }}
                                placeholder="gpt-4o, gpt-4o-mini"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Tooltip title="Name of the LLM model used for safety and quality judging (e.g., gpt-4o)" arrow>
                                                <InfoIconWithHover />
                                            </Tooltip>
                                        </InputAdornment>
                                    )
                                }}
                            />
                            <TextField
                                fullWidth
                                size="small"
                                label="Safety Score Threshold"
                                type="number"
                                value={llmThreshold}
                                onChange={(e) => setLlmThreshold(e.target.value)}
                                inputProps={{ step: "0.05", min: "0", max: "1" }}
                                sx={{ mb: 2.5 }}
                                helperText="Score >= this value overrides deterministic metrics"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Tooltip title="Minimum Safety Score (0-1) required to consider the content safe and qualitatively sound." arrow>
                                                <InfoIconWithHover />
                                            </Tooltip>
                                        </InputAdornment>
                                    )
                                }}
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', ml: 1 }}>
                                Hybrid Safety Scoring: Always Enabled
                            </Typography>
                        </Paper>

                        <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', mt: 2 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontSize: '0.9rem', mb: 1.5 }}>
                                Advanced Structured & JSON Metrics
                            </Typography>

                            <Grid container spacing={2.5}>
                                <Grid size={{ xs: 6 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Fuzzy Threshold"
                                        type="number"
                                        value={fuzzyThreshold}
                                        onChange={(e) => setFuzzyThreshold(e.target.value)}
                                        inputProps={{ step: "0.01", min: "0", max: "1" }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Tooltip title="Sensitivity for fuzzy string matching (0-1). Higher means stricter." arrow>
                                                        <InfoIconWithHover />
                                                    </Tooltip>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Short Text Definition (Chars)"
                                        type="number"
                                        value={shortTextLength}
                                        onChange={(e) => setShortTextLength(e.target.value)}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Tooltip title="Content shorter than this uses stricter matching." arrow>
                                                        <InfoIconWithHover />
                                                    </Tooltip>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                            </Grid>

                            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontSize: '0.85rem', color: '#2196f3' }}>
                                JSON RQS Weights
                            </Typography>
                            <Grid container spacing={2.5}>
                                <Grid size={{ xs: 3 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Acc Weight"
                                        type="number"
                                        value={wAccuracy}
                                        onChange={(e) => setWAccuracy(e.target.value)}
                                        inputProps={{ step: "0.05", min: "0", max: "1" }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Tooltip title="Accuracy weight for JSON items." arrow>
                                                        <InfoIconWithHover />
                                                    </Tooltip>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 3 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Comp Weight"
                                        type="number"
                                        value={wCompleteness}
                                        onChange={(e) => setWCompleteness(e.target.value)}
                                        inputProps={{ step: "0.05", min: "0", max: "1" }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Tooltip title="Completeness weight for JSON items." arrow>
                                                        <InfoIconWithHover />
                                                    </Tooltip>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 3 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Hall Weight"
                                        type="number"
                                        value={wHallucination}
                                        onChange={(e) => setWHallucination(e.target.value)}
                                        inputProps={{ step: "0.05", min: "0", max: "1" }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Tooltip title="Hallucination weight for JSON items." arrow>
                                                        <InfoIconWithHover />
                                                    </Tooltip>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 3 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Safe Weight"
                                        type="number"
                                        value={wSafety}
                                        onChange={(e) => setWSafety(e.target.value)}
                                        inputProps={{ step: "0.05", min: "0", max: "1" }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Tooltip title="Safety weight for JSON items." arrow>
                                                        <InfoIconWithHover />
                                                    </Tooltip>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {/* Save Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mx: 2, mb: 10 }}>
                <Button
                    variant="outlined"
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                    onClick={handleSave}
                    startIcon={<SaveIcon />}
                >
                    Save Configuration
                </Button>
            </Box>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
                message="Configuration saved successfully"
            />
        </Box>
    );
}
