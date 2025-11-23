import { Box, Typography, Button, Paper } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function RouteManagement() {
  const navigate = useNavigate();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Route Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/routes/add')}
        >
          Add New Route
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Route list with map integration will be displayed here...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Features:
          - View all routes on map
          - Draw routes with Google Maps Drawing Tools
          - Assign trucks and drivers
          - Set garbage collection schedule
          - Manage active/inactive status
        </Typography>
      </Paper>
    </Box>
  );
}
