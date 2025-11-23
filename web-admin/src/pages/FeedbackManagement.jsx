import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import { collection, getDocs, doc, updateDoc, addDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase';
import { useSnackbar } from 'notistack';

const STATUS_COLORS = {
  open: 'info',
  in_progress: 'warning',
  resolved: 'success',
  closed: 'default',
};

export default function FeedbackManagement() {
  const { enqueueSnackbar } = useSnackbar();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    // Real-time subscription to feedback
    const unsubscribe = onSnapshot(
      collection(db, COLLECTIONS.FEEDBACK),
      (snapshot) => {
        const feedbacksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Sort by date, newest first
        feedbacksData.sort((a, b) => {
          const aDate = a.createdAt?.toDate?.() || new Date(0);
          const bDate = b.createdAt?.toDate?.() || new Date(0);
          return bDate - aDate;
        });
        setFeedbacks(feedbacksData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching feedback:', error);
        enqueueSnackbar('Failed to load feedback', { variant: 'error' });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [enqueueSnackbar]);

  const handleOpenDialog = (feedback) => {
    setSelectedFeedback(feedback);
    setReplyMessage('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedFeedback(null);
    setReplyMessage('');
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      enqueueSnackbar('Please enter a message', { variant: 'error' });
      return;
    }

    try {
      const newMessage = {
        senderId: 'admin',
        senderName: 'Administrator',
        message: replyMessage.trim(),
        timestamp: new Date(),
        isAdmin: true,
      };

      // Update feedback with new message
      await updateDoc(doc(db, COLLECTIONS.FEEDBACK, selectedFeedback.id), {
        messages: arrayUnion(newMessage),
        status: selectedFeedback.status === 'open' ? 'in_progress' : selectedFeedback.status,
        updatedAt: new Date(),
      });

      // SRS 3.5: Send notification to user about the reply
      if (selectedFeedback.userId && selectedFeedback.userId !== 'anonymous') {
        await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
          userId: selectedFeedback.userId,
          title: 'Feedback Reply',
          message: `Admin replied to your feedback: "${selectedFeedback.subject}"`,
          type: 'feedback_reply',
          data: { feedbackId: selectedFeedback.id },
          read: false,
          createdAt: new Date(),
        });
      }

      enqueueSnackbar('Reply sent successfully', { variant: 'success' });
      setReplyMessage('');
    } catch (error) {
      console.error('Error sending reply:', error);
      enqueueSnackbar('Failed to send reply', { variant: 'error' });
    }
  };

  const handleStatusChange = async (feedbackId, newStatus) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.FEEDBACK, feedbackId), {
        status: newStatus,
        updatedAt: new Date(),
      });
      enqueueSnackbar('Status updated successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error updating status:', error);
      enqueueSnackbar('Failed to update status', { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Feedback Management
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        SRS 3.5: Anonymous feedback is supported. Users can submit feedback without logging in.
      </Alert>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Subject</TableCell>
              <TableCell>From</TableCell>
              <TableCell>Messages</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {feedbacks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No feedback received yet.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              feedbacks.map((feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {feedback.subject}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {feedback.userId === 'anonymous' ? (
                      <Chip label="Anonymous" size="small" variant="outlined" />
                    ) : (
                      feedback.userName || 'Unknown'
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${feedback.messages?.length || 0} message(s)`}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={feedback.status?.replace('_', ' ').toUpperCase()}
                      color={STATUS_COLORS[feedback.status] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {feedback.createdAt?.toDate
                      ? feedback.createdAt.toDate().toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(feedback)}
                      color="primary"
                    >
                      <ChatIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Feedback Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedFeedback && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{selectedFeedback.subject}</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label="Open"
                    color={selectedFeedback.status === 'open' ? 'info' : 'default'}
                    size="small"
                    onClick={() => handleStatusChange(selectedFeedback.id, 'open')}
                    sx={{ cursor: 'pointer' }}
                  />
                  <Chip
                    label="In Progress"
                    color={selectedFeedback.status === 'in_progress' ? 'warning' : 'default'}
                    size="small"
                    onClick={() => handleStatusChange(selectedFeedback.id, 'in_progress')}
                    sx={{ cursor: 'pointer' }}
                  />
                  <Chip
                    label="Resolved"
                    color={selectedFeedback.status === 'resolved' ? 'success' : 'default'}
                    size="small"
                    onClick={() => handleStatusChange(selectedFeedback.id, 'resolved')}
                    sx={{ cursor: 'pointer' }}
                  />
                  <Chip
                    label="Closed"
                    color={selectedFeedback.status === 'closed' ? 'default' : 'default'}
                    size="small"
                    onClick={() => handleStatusChange(selectedFeedback.id, 'closed')}
                    sx={{ cursor: 'pointer' }}
                  />
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                From: {selectedFeedback.userId === 'anonymous' ? 'Anonymous User' : selectedFeedback.userName}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <List sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                {selectedFeedback.messages?.map((msg, index) => (
                  <Box key={index}>
                    <ListItem
                      sx={{
                        flexDirection: 'column',
                        alignItems: msg.isAdmin ? 'flex-end' : 'flex-start',
                        pb: 2,
                      }}
                    >
                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          maxWidth: '80%',
                          bgcolor: msg.isAdmin ? 'primary.light' : 'grey.100',
                          color: msg.isAdmin ? 'primary.contrastText' : 'text.primary',
                        }}
                      >
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {msg.message}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.8 }}>
                          {msg.senderName} • {msg.timestamp?.toDate?.()?.toLocaleString() || 'Unknown time'}
                        </Typography>
                      </Paper>
                    </ListItem>
                    {index < selectedFeedback.messages.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>

              {selectedFeedback.userId === 'anonymous' && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  This is anonymous feedback. The user will not receive notifications about replies.
                </Alert>
              )}

              {selectedFeedback.status === 'closed' && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  This feedback is closed. Change the status to continue the conversation.
                </Alert>
              )}

              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Your Reply"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your message here..."
                  disabled={selectedFeedback.status === 'closed'}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
              <Button
                onClick={handleSendReply}
                variant="contained"
                startIcon={<SendIcon />}
                disabled={!replyMessage.trim() || selectedFeedback.status === 'closed'}
              >
                Send Reply
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
