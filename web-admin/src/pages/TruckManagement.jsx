import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
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
  TextField,
  CircularProgress,
  Chip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase';
import { useSnackbar } from 'notistack';
import BusyHoursManager from '../components/BusyHoursManager';

export default function TruckManagement() {
  const { enqueueSnackbar } = useSnackbar();
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);
  const [formData, setFormData] = useState({
    model: '',
    licenseNumber: '',
    registrationDate: '',
    onDuty: true,
    busyHours: [],
  });

  useEffect(() => {
    fetchTrucks();
  }, []);

  const fetchTrucks = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.TRUCKS));
      const trucksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTrucks(trucksData);
    } catch (error) {
      console.error('Error fetching trucks:', error);
      enqueueSnackbar('Failed to load trucks', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (truck = null) => {
    if (truck) {
      setEditingTruck(truck);
      setFormData({
        model: truck.model,
        licenseNumber: truck.licenseNumber,
        registrationDate: truck.registrationDate?.toDate
          ? truck.registrationDate.toDate().toISOString().split('T')[0]
          : '',
        onDuty: truck.onDuty ?? true,
        busyHours: truck.busyHours || [],
      });
    } else {
      setEditingTruck(null);
      setFormData({
        model: '',
        licenseNumber: '',
        registrationDate: '',
        onDuty: true,
        busyHours: [],
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTruck(null);
  };

  const handleSave = async () => {
    // Validation
    if (!formData.model || !formData.licenseNumber || !formData.registrationDate) {
      enqueueSnackbar('Please fill all required fields', { variant: 'error' });
      return;
    }

    try {
      const truckData = {
        model: formData.model,
        licenseNumber: formData.licenseNumber,
        registrationDate: new Date(formData.registrationDate),
        onDuty: formData.onDuty,
        busyHours: formData.busyHours,
      };

      if (editingTruck) {
        // Update existing truck
        await updateDoc(doc(db, COLLECTIONS.TRUCKS, editingTruck.id), {
          ...truckData,
          updatedAt: new Date(),
        });
        enqueueSnackbar('Truck updated successfully', { variant: 'success' });
      } else {
        // Add new truck
        await addDoc(collection(db, COLLECTIONS.TRUCKS), {
          ...truckData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        enqueueSnackbar('Truck added successfully', { variant: 'success' });
      }

      handleCloseDialog();
      fetchTrucks();
    } catch (error) {
      console.error('Error saving truck:', error);
      enqueueSnackbar('Failed to save truck', { variant: 'error' });
    }
  };

  const handleDelete = async (truckId) => {
    if (!window.confirm('Are you sure you want to delete this truck?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, COLLECTIONS.TRUCKS, truckId));
      enqueueSnackbar('Truck deleted successfully', { variant: 'success' });
      fetchTrucks();
    } catch (error) {
      console.error('Error deleting truck:', error);
      enqueueSnackbar('Failed to delete truck', { variant: 'error' });
    }
  };

  const toggleOnDuty = async (truck) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.TRUCKS, truck.id), {
        onDuty: !truck.onDuty,
        updatedAt: new Date(),
      });
      enqueueSnackbar(`Truck ${truck.onDuty ? 'off' : 'on'} duty`, { variant: 'success' });
      fetchTrucks();
    } catch (error) {
      console.error('Error toggling truck status:', error);
      enqueueSnackbar('Failed to update truck status', { variant: 'error' });
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Truck Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Truck
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Model</TableCell>
              <TableCell>License Number</TableCell>
              <TableCell>Registration Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Busy Hours</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trucks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No trucks found. Click "Add Truck" to register one.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              trucks.map((truck) => (
                <TableRow key={truck.id}>
                  <TableCell>{truck.model}</TableCell>
                  <TableCell>{truck.licenseNumber}</TableCell>
                  <TableCell>
                    {truck.registrationDate?.toDate
                      ? truck.registrationDate.toDate().toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={truck.onDuty ? 'On Duty' : 'Off Duty'}
                      color={truck.onDuty ? 'success' : 'default'}
                      size="small"
                      onClick={() => toggleOnDuty(truck)}
                      sx={{ cursor: 'pointer' }}
                    />
                  </TableCell>
                  <TableCell>
                    {truck.busyHours && truck.busyHours.length > 0 ? (
                      <Chip label={`${truck.busyHours.length} period(s)`} size="small" />
                    ) : (
                      <Typography variant="body2" color="text.secondary">None</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(truck)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(truck.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTruck ? 'Edit Truck' : 'Add New Truck'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Truck Model *"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            sx={{ mb: 2, mt: 2 }}
          />

          <TextField
            fullWidth
            label="License Number *"
            value={formData.licenseNumber}
            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            type="date"
            label="Registration Date *"
            value={formData.registrationDate}
            onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.onDuty}
                onChange={(e) => setFormData({ ...formData, onDuty: e.target.checked })}
              />
            }
            label="On Duty"
            sx={{ mb: 2 }}
          />

          <Box sx={{ mt: 2 }}>
            <BusyHoursManager
              busyHours={formData.busyHours}
              onChange={(hours) => setFormData({ ...formData, busyHours: hours })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingTruck ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
