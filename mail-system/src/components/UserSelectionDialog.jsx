import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  TextField,
  Box,
  CircularProgress,
  Typography,
  Alert,
} from '@mui/material';
import axios from 'axios';

function UserSelectionDialog({ open, onClose, onSelect, selectedUsers }) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(selectedUsers || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        searchUsers(searchTerm);
      } else {
        fetchAllUsers();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchAllUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://192.168.100.236:5000/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://192.168.100.236:5000/api/users/search?query=${encodeURIComponent(query)}`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Failed to search users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAllUsers();
    }
  }, [open]);

  const handleToggle = (userId) => {
    setSelected(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSubmit = () => {
    onSelect(selected);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select Users</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Search Users"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            margin="dense"
            placeholder="Search by ID, name, or email"
          />
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : users.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
            No users found
          </Typography>
        ) : (
          <List>
            {users.map((user) => (
              <ListItem key={user.UserID} button>
                <ListItemText 
                  primary={user.LVL}
                  secondary={`${user.UserID}`}
                />
                <ListItemSecondaryAction>
                  <Checkbox
                    edge="end"
                    checked={selected.includes(user.UserID)}
                    onChange={() => handleToggle(user.UserID)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          Select
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UserSelectionDialog; 