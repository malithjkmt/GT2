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
  Alert,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase';
import { useSnackbar } from 'notistack';
import BusyHoursManager from '../components/BusyHoursManager';

export default function DriverManagement() {
  const { enqueueSnackbar } = useSnackbar();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    nic: '',
    employeeNumber: '',
    name: '',
    licenseNumber: '',
    phoneNumber: '',
    busyHours: [],
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.DRIVERS));
      const driversData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDrivers(driversData);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      enqueueSnackbar('Failed to load drivers', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (driver = null) => {
    if (driver) {
      setEditingDriver(driver);
      setFormData({
        nic: driver.nic,
        employeeNumber: driver.employeeNumber || '',
        name: driver.name,
        licenseNumber: driver.licenseNumber,
        phoneNumber: driver.phoneNumber,
        busyHours: driver.busyHours || [],
      });
    } else {
      setEditingDriver(null);
      setFormData({
        nic: '',
        employeeNumber: '',
        name: '',
        licenseNumber: '',
        phoneNumber: '',
        busyHours: [],
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingDriver(null);
  };

  const handleSave = async () => {
    // Validation
    if (!formData.nic || !formData.employeeNumber || !formData.name ||
        !formData.licenseNumber || !formData.phoneNumber) {
      enqueueSnackbar('Please fill all required fields', { variant: 'error' });
      return;
    }

    try {
      if (editingDriver) {
        // Update existing driver
        await updateDoc(doc(db, COLLECTIONS.DRIVERS, editingDriver.id), {
          ...formData,
          updatedAt: new Date(),
        });
        enqueueSnackbar('Driver updated successfully', { variant: 'success' });
      } else {
        // Add new driver
        await addDoc(collection(db, COLLECTIONS.DRIVERS), {
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        enqueueSnackbar('Driver added successfully', { variant: 'success' });
      }

      handleCloseDialog();
      fetchDrivers();
    } catch (error) {
      console.error('Error saving driver:', error);
      enqueueSnackbar('Failed to save driver', { variant: 'error' });
    }
  };

  const handleDelete = async (driverId) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, COLLECTIONS.DRIVERS, driverId));
      enqueueSnackbar('Driver deleted successfully', { variant: 'success' });
      fetchDrivers();
    } catch (error) {
      console.error('Error deleting driver:', error);
      enqueueSnackbar('Failed to delete driver', { variant: 'error' });
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
          Driver Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Driver
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee Number</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>NIC</TableCell>
              <TableCell>License Number</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell>Busy Hours</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {drivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No drivers found. Click "Add Driver" to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              drivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell>{driver.employeeNumber || 'N/A'}</TableCell>
                  <TableCell>{driver.name}</TableCell>
                  <TableCell>{driver.nic}</TableCell>
                  <TableCell>{driver.licenseNumber}</TableCell>
                  <TableCell>{driver.phoneNumber}</TableCell>
                  <TableCell>
                    {driver.busyHours && driver.busyHours.length > 0 ? (
                      <Chip label={`${driver.busyHours.length} period(s)`} size="small" />
                    ) : (
                      <Typography variant="body2" color="text.secondary">None</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(driver)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(driver.id)}
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
          {editingDriver ? 'Edit Driver' : 'Add New Driver'}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2, mt: 1 }}>
            Employee number is required as per SRS 3.1.1.1.3
          </Alert>

          <TextField
            fullWidth
            label="Employee Number *"
            value={formData.employeeNumber}
            onChange={(e) => setFormData({ ...formData, employeeNumber: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
            helperText="Required field per SRS requirements"
          />

          <TextField
            fullWidth
            label="Full Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="NIC (National Identity Card) *"
            value={formData.nic}
            onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
            sx={{ mb: 2 }}
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
            label="Phone Number *"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            sx={{ mb: 2 }}
            helperText="Used for SMS notifications when routes are assigned"
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
            {editingDriver ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
