import { Grid, Paper, Typography, Box } from '@mui/material';
import {
  LocalShipping as TruckIcon,
  Route as RouteIcon,
  Person as DriverIcon,
  Feedback as FeedbackIcon,
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color }) => (
  <Paper sx={{ p: 3 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box>
        <Typography color="text.secondary" gutterBottom variant="overline">
          {title}
        </Typography>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      </Box>
      <Box sx={{ color, fontSize: 48 }}>
        {icon}
      </Box>
    </Box>
  </Paper>
);

export default function Dashboard() {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Routes"
            value="12"
            icon={<RouteIcon fontSize="inherit" />}
            color="#2196F3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Trucks"
            value="8"
            icon={<TruckIcon fontSize="inherit" />}
            color="#4CAF50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Drivers"
            value="15"
            icon={<DriverIcon fontSize="inherit" />}
            color="#FF9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Feedback"
            value="5"
            icon={<FeedbackIcon fontSize="inherit" />}
            color="#F44336"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Activity log will be displayed here...
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quick action buttons will be displayed here...
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
