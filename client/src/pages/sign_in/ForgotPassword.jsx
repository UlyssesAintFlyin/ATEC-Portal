import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Link,
    Stepper,
    Step,
    StepLabel,
    Container
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;
const steps = ['Request Code', 'Verify OTP'];

function ForgotPassword() {
    const [activeStep, setActiveStep] = useState(0);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email) {
            setError('Please enter your email address.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to send OTP.');

            setSuccess('Verification code sent to your email.');
            setActiveStep(1);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!otp) {
            setError('Please enter the OTP code.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Invalid or expired OTP.');

            setSuccess('A new password has been generated and sent to your email!');
            setTimeout(() => {
                navigate('/signin');
            }, 3500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', bgcolor: '#F4F6F8' }}>
            <Container maxWidth="xs">
                <Paper elevation={4} sx={{ p: 4, borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box
                        component="img"
                        src="/resources/atec-word-logo.png"
                        alt="ATEC Logo"
                        sx={{ maxWidth: 180, mb: 3 }}
                    />

                    <Typography variant="h5" component="h1" fontWeight="bold" align="center" gutterBottom sx={{ color: '#242C54' }}>
                        Reset Password
                    </Typography>

                    <Stepper activeStep={activeStep} alternativeLabel sx={{ width: '100%', mb: 3 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
                            {success}
                        </Alert>
                    )}

                    {activeStep === 0 ? (
                        <Box component="form" onSubmit={handleRequestOtp} noValidate sx={{ width: '100%' }}>
                            <TextField
                                label="Email Address"
                                type="email"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                disabled={loading}
                                sx={{ mt: 2, py: 1.2, bgcolor: '#242C54', '&:hover': { bgcolor: '#1a203e' } }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Send OTP Code'}
                            </Button>
                        </Box>
                    ) : (
                        <Box component="form" onSubmit={handleVerifyOtp} noValidate sx={{ width: '100%' }}>
                            <TextField
                                label="Enter 6-Digit OTP"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                inputProps={{ maxLength: 6 }}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                disabled={loading}
                                sx={{ mt: 2, py: 1.2, bgcolor: '#242C54', '&:hover': { bgcolor: '#1a203e' } }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify Code & Send Password'}
                            </Button>
                        </Box>
                    )}

                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Link
                            component="button"
                            type="button"
                            variant="body2"
                            underline="hover"
                            onClick={() => navigate('/signin')}
                            sx={{ color: '#242C54' }}
                        >
                            Back to Login
                        </Link>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}

export default ForgotPassword;