import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Create as CreateIcon,
  Email as EmailIcon,
  AccountCircle,
  Person as PersonIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  Inbox as InboxIcon,
  Send as SendIcon,
  Drafts as DraftsIcon,
} from '@mui/icons-material';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/');
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleCompose = () => {
    navigate('/new-mail');
  };

  // Mock data for mail counts
  const mailStats = {
    inbox: 5,
    outbox: 3,
    draft: 2
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Mail System
          </Typography>
          <Button
            color="inherit"
            startIcon={<CreateIcon />}
            onClick={handleCompose}
          >
            Compose
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
        }}
      >
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Grid container spacing={3}>
            {/* User Information Card */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader
                  title="User Information"
                  avatar={<AccountCircle fontSize="large" />}
                />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <PersonIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="User ID" 
                        secondary={user?.userId} 
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemIcon>
                        <BusinessIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Superior" 
                        secondary={user?.superior || 'None'} 
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemIcon>
                        <SecurityIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Access Level" 
                        secondary={`Level ${user?.level}`} 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Mail Overview */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardHeader
                  title="Mail Overview"
                  avatar={<EmailIcon fontSize="large" />}
                />
                <CardContent>
                  <Grid container spacing={2}>
                    {/* Inbox */}
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <InboxIcon color="primary" sx={{ fontSize: 40 }} />
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          Inbox
                        </Typography>
                        <Chip 
                          label={mailStats.inbox} 
                          color="primary" 
                          sx={{ mt: 1 }} 
                        />
                        <Button 
                          variant="outlined" 
                          fullWidth 
                          sx={{ mt: 2 }}
                          startIcon={<InboxIcon />}
                        >
                          View Inbox
                        </Button>
                      </Paper>
                    </Grid>

                    {/* Outbox */}
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <SendIcon color="secondary" sx={{ fontSize: 40 }} />
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          Outbox
                        </Typography>
                        <Chip 
                          label={mailStats.outbox} 
                          color="secondary" 
                          sx={{ mt: 1 }} 
                        />
                        <Button 
                          variant="outlined" 
                          fullWidth 
                          sx={{ mt: 2 }}
                          startIcon={<SendIcon />}
                        >
                          View Outbox
                        </Button>
                      </Paper>
                    </Grid>

                    {/* Drafts */}
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <DraftsIcon color="action" sx={{ fontSize: 40 }} />
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          Drafts
                        </Typography>
                        <Chip 
                          label={mailStats.draft} 
                          sx={{ mt: 1 }} 
                        />
                        <Button 
                          variant="outlined" 
                          fullWidth 
                          sx={{ mt: 2 }}
                          startIcon={<DraftsIcon />}
                        >
                          View Drafts
                        </Button>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title="Recent Activity"
                  avatar={<EmailIcon fontSize="large" />}
                />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <InboxIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="New mail received" 
                        secondary="From: MISW-01 | Subject: Monthly Report" 
                      />
                      <Typography variant="caption" color="text.secondary">
                        2 hours ago
                      </Typography>
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemIcon>
                        <SendIcon color="secondary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Mail sent" 
                        secondary="To: MISW-02 | Subject: Project Update" 
                      />
                      <Typography variant="caption" color="text.secondary">
                        5 hours ago
                      </Typography>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

export default Dashboard; 