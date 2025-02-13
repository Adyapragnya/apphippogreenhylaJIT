import React, { useEffect, useState, useRef  } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import DrawTool from './DrawTool';
import axios from 'axios';
import PropTypes from 'prop-types';

const EditGeofences = ({ geofences, selectedGeofence, setSelectedGeofence, setGeofences   }) => {
  const map = useMap();

  const drawnItems = new L.FeatureGroup();

  const [selectedFeatureGroup, setSelectedFeatureGroup] = useState(new L.FeatureGroup());

    // Function to handle geofence selection from both click & dropdown
    const handleGeofenceSelect = (geofence) => {
      console.log(geofence);
      if (!geofence) return;
    
      const drawnItems = drawnItemsRef.current; // ✅ Use persisted reference
    
      // Reset the previous selected geofence's color
      if (selectedFeatureGroup.getLayers().length > 0) {
        selectedFeatureGroup.getLayers().forEach((layer) => {
          layer.setStyle({ color: 'blue' }); // Reset color to default (or original color)
        });
      }
    
      // Remove previous selection
      selectedFeatureGroup.clearLayers();
      // console.log("After clearing layers:", selectedFeatureGroup.getLayers());
    
      // Find the corresponding map layer
      const targetLayer = drawnItems.getLayers().find(
        (layer) => layer.options.geofenceId === geofence.geofenceId
      );
    
      if (targetLayer) {
        targetLayer.setStyle({ color: 'red' }); // Highlight selected geofence
        selectedFeatureGroup.addLayer(targetLayer);
        // console.log("New selection layers:", selectedFeatureGroup.getLayers());
    
        map.fitBounds(targetLayer.getBounds());
      }
    
      setSelectedGeofence(geofence);
      setSelectedFeatureGroup(selectedFeatureGroup);
    };
    
  
    
  // const onGeofenceClick = (e, geofence) => {
  //   if (selectedFeatureGroup.getLayers().length > 0) {
  //     selectedFeatureGroup.clearLayers(); // Clear previously selected geofence
  //   }
  
  //   const layer = e.target;
  //   layer.setStyle({ color: 'red' });
  
  //   selectedFeatureGroup.addLayer(layer); // Add only the selected geofence for editing
  //   setSelectedFeatureGroup(selectedFeatureGroup);
  // };
  
  
  // Function to create map layer from geofence data
  const createLayerFromGeofence = (geofence) => {
    let layer;
    const positions = geofence.coordinates.map((coord) => [coord.lng, coord.lat]);

    if (!positions.length) return null;

    const options = {
      color: 'blue',
      geofenceId: geofence.geofenceId,
      geofenceName: geofence.geofenceName,
      geofenceType: geofence.geofenceType,
    };

    // Handle different geofence types (e.g., Polygon, Circle, Polyline)
    if (geofence.geofenceType === 'Polygon' || geofence.geofenceType === 'Berth' || geofence.geofenceType === 'global' || geofence.geofenceType === 'anchorArea' || geofence.geofenceType === 'Terminal') {
      layer = new L.Polygon(positions, options);
    } else if (geofence.geofenceType === 'Circle') {
      const center = positions[0];
      const radius = geofence.coordinates[0].radius;
      layer = new L.Circle(center, { ...options, radius });
    } else if (geofence.geofenceType === 'Line') {
      layer = new L.Polyline(positions, options);
    }

    if (layer) {
      layer.bindTooltip(`Name: ${geofence.geofenceName}`, { permanent: false });
      // Add event listener for clicking the geofence to select it
      // layer.on('click', (e) => onGeofenceClick(e, geofence));
      layer.on('click', () => handleGeofenceSelect(geofence));
    }

    return layer;
  };

  const drawnItemsRef = useRef(new L.FeatureGroup());

  useEffect(() => {
    if (!map) return;
  
    const drawnItems = drawnItemsRef.current;
    map.addLayer(drawnItems);
    drawnItems.clearLayers();
  
    geofences.forEach((geofence) => {
      const layer = createLayerFromGeofence(geofence);
      if (layer) drawnItems.addLayer(layer);
    });
  
    return () => {
      drawnItems.clearLayers();
      map.removeLayer(drawnItems);
    };
  }, [map, geofences]);


   // Handle dropdown selection effect
   useEffect(() => {
    if (selectedGeofence) {
      handleGeofenceSelect(selectedGeofence);
    }
  }, [selectedGeofence]);


  const updateGeofenceInDB = async (geofence) => {
    if (!geofence) return;

    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      await axios.put(`${baseURL}/api/geofences/${geofence.geofenceId}`, geofence);
     
      setSelectedGeofence(null);

    } catch (error) {
      console.error('Error updating geofence:', error);
    }
  };


  const deleteGeofenceFromDB = async (geofenceId) => {
    // console.log(geofenceId);
    if (!geofenceId) return;
  
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      // Send the delete request to the backend
      await axios.delete(`${baseURL}/api/geofences/${geofenceId}`);
 
     // Remove deleted geofence from state
     setGeofences((prevGeofences) => prevGeofences.filter(g => g.geofenceId !== geofenceId));

    
      setSelectedGeofence(null);
    } catch (error) {
      console.error('Error deleting geofence from DB:', error);
    }
  };

  

  return (
    <DrawTool selectedFeatureGroup={selectedFeatureGroup} onGeofenceEdited={updateGeofenceInDB}  onGeofenceDeleted={deleteGeofenceFromDB} />

  );
};

EditGeofences.propTypes = {
  geofences: PropTypes.array.isRequired,
  selectedGeofence: PropTypes.object,
  setSelectedGeofence: PropTypes.func.isRequired,
  setGeofences: PropTypes.func.isRequired,
};


export default EditGeofences;
