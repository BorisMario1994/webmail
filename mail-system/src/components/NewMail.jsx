import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  People as PeopleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import UserSelectionDialog from './UserSelectionDialog';

// Maximum file size in bytes (60MB)
const MAX_FILE_SIZE = 60 * 1024 * 1024;

function NewMail() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    to: '',
    cc: '',
    subject: '',
    message: '',
  });
  const [toDialogOpen, setToDialogOpen] = useState(false);
  const [ccDialogOpen, setCcDialogOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [superiorDialogOpen, setSuperiorDialogOpen] = useState(false);
  const [senderSuperior, setSenderSuperior] = useState(null);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setError('');

    // Check total size of new files
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    if (totalSize > MAX_FILE_SIZE) {
      setError('Total file size exceeds 60MB limit');
      return;
    }

    // Add new files to attachments
    setAttachments(prev => [...prev, ...files]);
  };

  const handleRemoveAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const fetchSenderSuperior = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('=== Debugging fetchSenderSuperior ===');
      console.log('1. Token from localStorage:', token);
      
      if (!token) {
        console.log('No token found for superior fetch');
        setError('Please login again');
        navigate('/login');
        return;
      }

      console.log('2. Preparing request to /api/users/me');
      console.log('3. Request headers:', {
        'Authorization': `Bearer ${token}`
      });

      const response = await fetch('http://192.168.100.236:5000/api/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('4. Response status:', response.status);
      console.log('5. Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        if (response.status === 401) {
          console.log('Token expired or invalid for superior fetch');
          setError('Your session has expired. Please login again.');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch superior information');
      }

      const data = await response.json();
      console.log('6. Response data:', data);
      setSenderSuperior(data.Superior);
    } catch (error) {
      console.error('Error in fetchSenderSuperior:', error);
      setError('Failed to fetch superior information');
    }
  };

  useEffect(() => {
    fetchSenderSuperior();
  }, []);

  const validateRecipients = async (recipients) => {
    try {
      // First check if superior is included
      if (senderSuperior) {
        const recipientList = recipients.split(',').map(r => r.trim());
        const toList = formData.to.split(',').map(r => r.trim());
        const ccList = formData.cc ? formData.cc.split(',').map(r => r.trim()) : [];
        
        // Check if superior is in either TO or CC
        if (!toList.includes(senderSuperior) && !ccList.includes(senderSuperior)) {
          setSuperiorDialogOpen(true);
          return false;
        }
      }

      const response = await fetch('http://192.168.100.236:5000/api/mail/validate-recipients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ recipients }),
      });

      const data = await response.json();
      console.log(data);
      
      if (!response.ok) {
        if (data.invalidRecipients) {
          setValidationError(`Invalid recipients: ${data.invalidRecipients.join(', ')}`);
        } else {
          setValidationError(data.error || 'Failed to validate recipients');
        }
        return false;
      }

      setValidationError('');
      return true;
    } catch (error) {
      setValidationError('Failed to validate recipients');
      return false;
    }
  };

  const handleSuperiorDialogClose = () => {
    setSuperiorDialogOpen(false);
  };

  const handleSuperiorDialogConfirm = () => {
    setSuperiorDialogOpen(false);
    // Add superior to CC if not already there
    if (formData.cc) {
      const ccList = formData.cc.split(',').map(r => r.trim());
      if (!ccList.includes(senderSuperior)) {
        setFormData(prev => ({
          ...prev,
          cc: `${prev.cc}, ${senderSuperior}`
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        cc: senderSuperior
      }));
    }
  };

  const handleSend = async () => {
    try {
      setError('');
      setSuccess('');
      
      // Debug: Check token
      const token = localStorage.getItem('token');
      console.log('Current token:', token);
      
      if (!token) {
        console.log('No token found in localStorage');
        setError('Please login again');
        navigate('/login');
        return;
      }

      // Validate recipients
      const validationError = validateRecipients(formData.to + (formData.cc ? `,${formData.cc}` : ''));
      if (validationError) {
        setError(validationError);
        return;
      }

      // Check if superior is included
      if (senderSuperior && !validateRecipients(formData.to + (formData.cc ? `,${senderSuperior}` : ''))) {
        setSuperiorDialogOpen(true);
        return;
      }

      const formData = new FormData();
      formData.append('to', JSON.stringify(formData.to));
      formData.append('cc', JSON.stringify(formData.cc));
      formData.append('subject', formData.subject);
      formData.append('body', formData.message);
      formData.append('isDraft', 'false');

      // Add attachments if any
      attachments.forEach((file, index) => {
        formData.append('attachments', file);
      });

      console.log('Sending request with token:', token);
      const response = await fetch('http://192.168.100.236:5000/api/mail', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        if (response.status === 401) {
          console.log('Token expired or invalid');
          setError('Your session has expired. Please login again.');
          navigate('/login');
          return;
        }
        throw new Error(errorData.error || 'Failed to send mail');
      }

      const data = await response.json();
      setSuccess('Mail sent successfully!');
      navigate('/mail');
    } catch (error) {
      console.error('Error sending mail:', error);
      setError(error.message || 'Failed to send mail');
    }
  };

  const handleSaveDraft = async () => {
    setError('');
    setValidationError('');

    // Validate TO field for drafts
    if (!formData.to.trim()) {
      setValidationError('Please enter at least one recipient in the TO field');
      return;
    }

    // Validate recipients for drafts
    const allRecipients = [formData.to, formData.cc]
      .filter(Boolean)
      .join(',');
    
    const isValid = await validateRecipients(allRecipients);
    if (!isValid) {
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('recipients', formData.to);
      if (formData.cc) {
        formDataToSend.append('cc', formData.cc);
      }
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('body', formData.message);

      attachments.forEach((file) => {
        formDataToSend.append('attachments', file);
      });

      const response = await fetch('http://192.168.100.236:5000/api/mail/draft', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to save draft');
      }

      setFormData({ to: '', cc: '', subject: '', message: '' });
      setAttachments([]);
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to save draft. Please try again.');
      console.error('Error saving draft:', error);
    }
  };

  const handleUserSelect = (field, users) => {
    setFormData(prev => ({
      ...prev,
      [field]: users.join(', ')
    }));
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton 
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">
            Compose New Mail
          </Typography>
        </Box>
        
        {validationError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {validationError}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSend}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* To Field */}
            <TextField
              fullWidth
              label="To"
              name="to"
              value={formData.to}
              onChange={handleChange}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setToDialogOpen(true)}>
                      <PeopleIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* CC Field */}
            <TextField
              fullWidth
              label="CC"
              name="cc"
              value={formData.cc}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setCcDialogOpen(true)}>
                      <PeopleIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Subject Field */}
            <TextField
              fullWidth
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />

            {/* Message Field */}
            <TextField
              fullWidth
              label="Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              multiline
              rows={10}
              required
            />

            {/* Attachments Display */}
            {attachments.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {attachments.map((file, index) => (
                  <Chip
                    key={index}
                    label={`${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`}
                    onDelete={() => handleRemoveAttachment(index)}
                    deleteIcon={<CloseIcon />}
                  />
                ))}
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <input
                accept="*/*"
                style={{ display: 'none' }}
                id="file-attachment"
                multiple
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="file-attachment">
                <IconButton color="primary" component="span">
                  <AttachFileIcon />
                </IconButton>
              </label>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                startIcon={<SendIcon />}
              >
                Send
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSaveDraft}
              >
                Save as Draft
              </Button>
            </Box>
          </Box>
        </form>

        {/* User Selection Dialogs */}
        <UserSelectionDialog
          open={toDialogOpen}
          onClose={() => setToDialogOpen(false)}
          onSelect={(users) => handleUserSelect('to', users)}
          selectedUsers={formData.to.split(',').map(user => user.trim()).filter(Boolean)}
        />
        <UserSelectionDialog
          open={ccDialogOpen}
          onClose={() => setCcDialogOpen(false)}
          onSelect={(users) => handleUserSelect('cc', users)}
          selectedUsers={formData.cc.split(',').map(user => user.trim()).filter(Boolean)}
        />

        {/* Superior Dialog */}
        <Dialog
          open={superiorDialogOpen}
          onClose={handleSuperiorDialogClose}
        >
          <DialogTitle>Superior Required</DialogTitle>
          <DialogContent>
            <Typography>
              Your superior ({senderSuperior}) must be included in the recipients. Would you like to add them to CC?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSuperiorDialogClose}>Cancel</Button>
            <Button onClick={handleSuperiorDialogConfirm} color="primary" variant="contained">
              Add to CC
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}

export default NewMail; 