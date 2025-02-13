import React, { useState, useEffect } from 'react';
import { Box, TextField } from '@mui/material';
import axios from 'axios';
import ShipsInPort from './shipsinport'; // Import the shipsinport component
import PropTypes from 'prop-types'; // Import PropTypes

const ShipsInPortContainer = ({ vessels }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  // Filter vessels data based on the search query
  useEffect(() => {
    const filtered = vessels.filter((vessel) => {
      const vesselName = vessel?.NAME?.toLowerCase() || '';  // Safe check for NAME
      const destination = vessel?.AIS?.DESTINATION?.toLowerCase() || '';  // Safe check for AIS.DESTINATION
      const geofenceType = vessel?.AIS?.GeofenceType?.toLowerCase() || '';  // Safe check for AIS.GeofenceType

      return vesselName.includes(searchQuery.toLowerCase()) ||
             destination.includes(searchQuery.toLowerCase()) ||
             geofenceType.includes(searchQuery.toLowerCase());
    });
    setFilteredData(filtered);
  }, [searchQuery, vessels]); // Runs when searchQuery or vessels change

  return (
    <div>
      {/* Search input field outside the shipsinport component */}
      <Box sx={{ marginBottom: '16px' }}>
        <TextField
          label="Search"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ borderRadius: 2 }}
        />
      </Box>

      {/* Pass filtered data as a prop to shipsinport */}
      <ShipsInPort vessels={filteredData} onRowClick={(vesselData) => console.log(vesselData)} />
    </div>
  );
};

// Define PropTypes for the component
ShipsInPortContainer.propTypes = {
  vessels: PropTypes.array.isRequired, // vessels should be an array and it is required
};

export default ShipsInPortContainer;
