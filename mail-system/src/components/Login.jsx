import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Container, 
  Paper,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    password: ''
  });
  const [userIdError, setUserIdError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateUserId = (userId) => {
    // Check if the string is exactly 7 characters long
    return userId.length === 7;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'userId') {
      // Limit to 7 characters
      const formattedValue = value.slice(0, 7);
      setFormData({
        ...formData,
        [name]: formattedValue
      });
      
      // Validate the length
      if (formattedValue && !validateUserId(formattedValue)) {
        setUserIdError('UserID must be exactly 7 characters long');
      } else {
        setUserIdError('');
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    // Clear any previous errors when user types
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateUserId(formData.userId)) {
      setUserIdError('Please enter a valid 7-character UserID');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await axios.post('http://192.168.100.236:5000/api/auth/login', formData);
      
      if (response.data.success) {
        setSuccess(true);
        // Store the token and user data
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        // Redirect to dashboard or home page
        window.location.href = '/dashboard';
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Mail System Login
          </Typography>
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              Login successful! Redirecting...
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="userId"
              label="UserID"
              name="userId"
              autoComplete="off"
              autoFocus
              value={formData.userId}
              onChange={handleChange}
              error={!!userIdError}
              helperText={userIdError || "Enter your 7-character UserID"}
              inputProps={{
                maxLength: 7
              }}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || !!userIdError}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 