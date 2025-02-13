import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import Swal from 'sweetalert2';
import MapWithGeofences from './MapWithGeofences';
import MapWithMarkers from './MapWithMarkers';
import MapWithFullscreen from './MapWithFullscreen';
import MapWithDraw from './MapWithDraw';
import * as turf from '@turf/turf';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point, polygon, lineString } from '@turf/turf';
import 'leaflet.markercluster';
import { FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import MapWithPolylineGeofences from './MapWithPolylineGeofences';
import MapWithCircleGeofences from './MapWithCircleGeofences';
import './MyMapComponent.css'; // Import CSS file for styling
import MeasureControl from './MeasureControl';

import {   LayersControl } from 'react-leaflet';

const { BaseLayer } = LayersControl;

// import MapWithGeofencesTerrestrial from './MapWithGeofencesTerrestrial';
const MyMapComponent = ({ vessels, selectedVessel, setVesselEntries }) => {
  const [polygonGeofences, setPolygonGeofences] = useState([]);
  const [polylineGeofences, setPolylineGeofences] = useState([]);
  const [circleGeofences, setCircleGeofences] = useState([]);
  const [terrestrialGeofences, setTerrestrialGeofences] = useState([]);
  const [buttonControl, setButtonControl] = useState(false);
  const [vesselTableData, setVesselTableData] = useState([]);

  const handleButtonControl = () => {
    setButtonControl(prev => !prev);
  };



  useEffect(() => {
    const fetchGeofences = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const [polygonRes, polylineRes, circleRes, terrestrialRes] = await Promise.all([
          axios.get(`${baseURL}/api/polygongeofences`),
          axios.get(`${baseURL}/api/polylinegeofences`),
          axios.get(`${baseURL}/api/circlegeofences`),
          axios.get(`${baseURL}/api/polygonTerrestrialGeofences`),
         
        ]);
        setPolygonGeofences(polygonRes.data);
        setPolylineGeofences(polylineRes.data);
        setCircleGeofences(circleRes.data);
        setTerrestrialGeofences(terrestrialRes.data);
        console.log(terrestrialRes);
        console.log(terrestrialRes.data);
      } catch (error) {
        console.error('Error fetching geofences:', error);
      }
    };
    fetchGeofences();
  }, []);

  const ensureClosedPolygon = (coordinates) => {
    if (coordinates.length > 0) {
      const firstPoint = coordinates[0];
      const lastPoint = coordinates[coordinates.length - 1];
      if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
        coordinates.push([firstPoint[0], firstPoint[1]]);
      }
    }
    return coordinates;
  };

  useEffect(() => {
    const checkVesselsInGeofences = () => {
      const updatedVesselEntries = {};
      vessels.forEach((vessel) => {
        const vesselPoint = point([vessel.AIS.LONGITUDE, vessel.AIS.LATITUDE]);
  
        let isInsideAnyGeofence = false;
  
        const getCurrentDate = () => new Date().toISOString().split('T')[0];
  
        // Polygon geofences
        polygonGeofences.forEach((geofence) => {
          let geofenceCoordinates = geofence.coordinates.map(coord => [coord.lat, coord.lng]);
          geofenceCoordinates = ensureClosedPolygon(geofenceCoordinates);
          const geofencePolygon = polygon([geofenceCoordinates]);
          const isInside = booleanPointInPolygon(vesselPoint, geofencePolygon);
  
          if (isInside) {
            if (vesselTableData[vessel.AIS.NAME]?.status !== 'Inside') {
              const geofenceInsideTime = getCurrentDate();
              updatedVesselEntries[vessel.AIS.NAME] = {
                entryTime: vesselTableData[vessel.AIS.NAME]?.entryTime || geofenceInsideTime,
                geofence: geofence.geofenceName,
                status: 'Inside',
                exitTime: null
              };
              isInsideAnyGeofence = true;
              updateGeofenceInDB(vessel.AIS.NAME, vessel.AIS.LATITUDE, vessel.AIS.LONGITUDE, geofenceInsideTime, geofence.geofenceName, 'Inside');
            }
          }
        });

        
        // terrestrial geofences
        // terrestrialGeofences.forEach((geofence) => {
        //   let geofenceCoordinates = geofence.coordinates.map(coord => [coord.lat, coord.lng]);
        //   geofenceCoordinates = ensureClosedPolygon(geofenceCoordinates);
        //   const geofencePolygon = polygon([geofenceCoordinates]);
        //   const isInside = booleanPointInPolygon(vesselPoint, geofencePolygon);
  
        //   if (isInside) {
        //     if (vesselTableData[vessel.name]?.status !== 'Inside') {
        //       const geofenceInsideTime = getCurrentDate();
        //       updatedVesselEntries[vessel.name] = {
        //         entryTime: vesselTableData[vessel.name]?.entryTime || geofenceInsideTime,
        //         geofence: geofence.geofenceName,
        //         status: 'Inside',
        //         exitTime: null
        //       };
        //       isInsideAnyGeofence = true;
        //       updateGeofenceInDB(vessel.name, vessel.lat, vessel.lng, geofenceInsideTime, geofence.geofenceName, 'Inside');
        //     }
        //   }
        // });
  
        // Circle geofences
        circleGeofences.forEach((geofence) => {
          const { lat, lng, radius } = geofence.coordinates[0];
          const distance = turf.distance(vesselPoint, point([lng, lat]), { units: 'meters' });
          const isInsideCircle = distance <= radius;
  
          if (isInsideCircle) {
            if (vesselTableData[vessel.AIS.NAME]?.status !== 'Inside') {
              const geofenceInsideTime = getCurrentDate();
              updatedVesselEntries[vessel.AIS.NAME] = {
                entryTime: vesselTableData[vessel.AIS.NAME]?.entryTime || geofenceInsideTime,
                geofence: geofence.geofenceName,
                status: 'Inside',
                exitTime: null
              };
              isInsideAnyGeofence = true;
              updateGeofenceInDB(vessel.AIS.NAME, vessel.AIS.LATITUDE, vessel.AIS.LONGITUDE, geofenceInsideTime, geofence.geofenceName, 'Inside');
            }
          }
        });
  
        // Polyline geofences
        polylineGeofences.forEach((geofence) => {
          const geofenceLine = lineString(geofence.coordinates.map(coord => [coord.lng, coord.lat]));
          const distanceToPolyline = turf.pointToLineDistance(vesselPoint, geofenceLine, { units: 'meters' });
          const isNearPolyline = distanceToPolyline <= 3000;
  
          if (isNearPolyline) {
            if (!updatedVesselEntries[vessel.AIS.NAME] || !updatedVesselEntries[vessel.AIS.NAME].status.includes('Near')) {
              updatedVesselEntries[vessel.AIS.NAME] = {
                entryTime: vesselTableData[vessel.AIS.NAME]?.entryTime || getCurrentDate(),
                geofence: geofence.geofenceName,
                status: `Near ${Math.round(distanceToPolyline)} meters`,
                exitTime: null
              };
              isInsideAnyGeofence = true;
              updateGeofenceInDB(vessel.AIS.NAME, vessel.AIS.LATITUDE, vessel.AIS.LONGITUDE, getCurrentDate(), geofence.geofenceName, 'Near');
            }
          }
        });
  
        // Check for exit status
        if (!isInsideAnyGeofence && (vesselTableData[vessel.AIS.NAME]?.status === 'Inside' || vesselTableData[vessel.AIS.NAME]?.status.includes('Near'))) {
          updatedVesselEntries[vessel.AIS.NAME] = {
            status: 'Outside',
            exitTime: getCurrentDate()
          };
          updateGeofenceInDB(vessel.AIS.NAME, vessel.AIS.LATITUDE, vessel.AIS.LONGITUDE, getCurrentDate(), null, 'Outside');
        }
      });
  
      setVesselEntries((prevEntries) => ({
        ...prevEntries,
        ...updatedVesselEntries
      }));
    };
  
    if (vessels.length && (polygonGeofences.length || circleGeofences.length || polylineGeofences.length )) {
      checkVesselsInGeofences();
    }
  }, [vessels, polygonGeofences, circleGeofences, polylineGeofences, setVesselEntries]);
  
  const updateGeofenceInDB = async (vesselName, LATITUDE, LONGITUDE, TIMESTAMP, geofenceName, geofenceFlag) => {
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      // await axios.post(`${baseURL}/api/vesselHistory/${vesselName}`, {
      //   LATITUDE,
      //   LONGITUDE,
      //   TIMESTAMP,
      //   geofenceName,  
      //   geofenceFlag   
      // });
     
    } catch (error) {
      console.error('Error updating geofence status in DB:', error);
    }
  };
  



  return (
    <>
      {/* <div className="checkbox-container">
        <label className="checkbox-label">
          <input type="checkbox" checked={buttonControl} onChange={handleButtonControl} />
          Draw Mode
        </label>
      </div> */}
      <br></br>


     
      <MapContainer center={[0, 0]} minZoom={2.3} zoom={1.5} maxZoom={18} 
                    maxBounds={[[180, -180], [-180, 180]]} // Strict world bounds to prevent panning
                    maxBoundsViscosity={8} // Makes the map rigid
                   style={{ height: '55vh', width: '100%'
                  //  , backgroundColor: 'rgba(170,211,223,255)'
                   }}>
      
      <LayersControl position="topright">

         {/* Satellite Layer (using Mapbox as an example) */}
         <BaseLayer  name="Mapbox Satellite">
      <TileLayer
        url="https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoidmlydTEyMjEiLCJhIjoiY2xpZnNnMW96MG5wdDNxcGRrZm16MHpmNyJ9.6s-u4RK92AQRxLZu2F4Rzw"
        noWrap={true}
      />
    </BaseLayer>

    

    {/* OpenStreetMap Layer */}
    <BaseLayer checked name="OpenStreetMap">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        noWrap={true}
      />
    </BaseLayer>

   

    
  </LayersControl>
        <MapWithMarkers vessels={vessels} selectedVessel={selectedVessel}   />
        <MapWithFullscreen />
        {buttonControl && <MapWithDraw />}
        {/* <MapWithGeofences geofences={polygonGeofences} /> */}
        {/* <MapWithPolylineGeofences geofences={polylineGeofences} /> */}
        {/* <MapWithCircleGeofences geofences={circleGeofences} /> */}
        {/* <MapWithGeofencesTerrestrial geofences={terrestrialGeofences} /> */}
        {/* <MeasureControl/> */}
      </MapContainer>
    </>
  );
};

MyMapComponent.propTypes = {
  vessels: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedVessel: PropTypes.object,
  setVesselEntries: PropTypes.func.isRequired,
};

export default MyMapComponent;


