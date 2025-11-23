import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export default function BusyHoursManager({ busyHours = [], onChange }) {
  const [newBusyHour, setNewBusyHour] = useState({
    day: 'Monday',
    startTime: '08:00',
    endTime: '17:00',
  });

  const handleAdd = () => {
    // Validate times
    if (newBusyHour.startTime >= newBusyHour.endTime) {
      alert('End time must be after start time');
      return;
    }

    onChange([...busyHours, newBusyHour]);

    // Reset form
    setNewBusyHour({
      day: 'Monday',
      startTime: '08:00',
      endTime: '17:00',
    });
  };

  const handleDelete = (index) => {
    const updated = busyHours.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Busy Hours
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Set times when this driver/truck is not available for new routes
      </Typography>

      {/* Existing busy hours list */}
      {busyHours.length > 0 && (
        <List sx={{ mb: 2 }}>
          {busyHours.map((bh, index) => (
            <ListItem key={index} divider>
              <ListItemText
                primary={`${bh.day}: ${bh.startTime} - ${bh.endTime}`}
                secondary={`Duration: ${calculateDuration(bh.startTime, bh.endTime)}`}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleDelete(index)} color="error">
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {busyHours.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
          No busy hours set. This driver/truck is available for all routes.
        </Typography>
      )}

      {/* Add new busy hour form */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Day</InputLabel>
          <Select
            value={newBusyHour.day}
            onChange={(e) => setNewBusyHour({ ...newBusyHour, day: e.target.value })}
            label="Day"
            size="small"
          >
            {DAYS_OF_WEEK.map(day => (
              <MenuItem key={day} value={day}>{day}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          type="time"
          label="Start Time"
          value={newBusyHour.startTime}
          onChange={(e) => setNewBusyHour({ ...newBusyHour, startTime: e.target.value })}
          InputLabelProps={{ shrink: true }}
          size="small"
        />

        <TextField
          type="time"
          label="End Time"
          value={newBusyHour.endTime}
          onChange={(e) => setNewBusyHour({ ...newBusyHour, endTime: e.target.value })}
          InputLabelProps={{ shrink: true }}
          size="small"
        />

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          size="small"
        >
          Add
        </Button>
      </Box>
    </Paper>
  );
}

function calculateDuration(startTime, endTime) {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  const durationMinutes = endMinutes - startMinutes;
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  return `${hours}h ${minutes}m`;
}
