import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import axios from "axios";
import ArgonBox from "components/ArgonBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MapWithDraw from "./MapWithDraw";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import EditGeofences from './EditGeofences';
import MapWithFullscreen from './MapWithFullscreen';

import Autocomplete from "@mui/material/Autocomplete";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";

import { Button, Box } from "@mui/material";

const ModifyGeofence = () => {
  const [geofences, setGeofences] = useState([]);
  const [mapCenter, setMapCenter] = useState([0, 0]);
  const [selectedGeofence, setSelectedGeofence] = useState(null);
  const [editingMode, setEditingMode] = useState(false); // Manage editing mode
  const [geofenceNames, setGeofenceNames] = useState([]);

  const handleGeofenceSelect = (event, value) => {
    if (!value) {
      setSelectedGeofence(null); // If nothing is selected, reset selectedGeofence
      return;
    }

    // Find the selected geofence from geofences
    const geofenceData = geofences.find((geofence) => geofence.geofenceName === value.geofenceName);
    setSelectedGeofence(geofenceData || null);
  };

  const fetchGeofences = async () => {
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      const response = await axios.get(`${baseURL}/api/geofences`);
      setGeofences(response.data);



      const firstValidGeofence = response.data.find(
        (geofence) =>
          geofence.coordinates &&
          geofence.coordinates[0] &&
          !isNaN(geofence.coordinates[0].lat) &&
          !isNaN(geofence.coordinates[0].lng)
      );

      if (firstValidGeofence) {
        setMapCenter([firstValidGeofence.coordinates[0].lat, firstValidGeofence.coordinates[0].lng]);
      }
    } catch (error) {
      console.error('Error fetching geofences:', error);
    }
  };

  useEffect(() => {
    fetchGeofences();
  }, []);

  return (
    <DashboardLayout>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <ArgonBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ flex: 1 }}>
                  
                  <Autocomplete
                    options={geofences} // Assuming you have a ports data array
                    getOptionLabel={(option) => (option?.geofenceName ? option.geofenceName : "")} // Ensure option exists
                    value={selectedGeofence}
                    onChange={handleGeofenceSelect}
                    filterOptions={(options, { inputValue }) => 
                      options.filter(option =>
                        option.geofenceName.toLowerCase().includes(inputValue.toLowerCase())
                      )
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Select Geofence to Edit or Delete" variant="outlined" />
                    )}
                  />
                </Box>
                
                <MapContainer center={mapCenter} zoom={2} style={{ height: '730px' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapWithFullscreen />

                  <EditGeofences
  geofences={geofences}
  selectedGeofence={selectedGeofence}
  setSelectedGeofence={setSelectedGeofence}
  setGeofences={setGeofences}
/>
                  <MapWithDraw />
                </MapContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
};

export default ModifyGeofence;
