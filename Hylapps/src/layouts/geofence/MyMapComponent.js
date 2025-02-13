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
import MapWithGeofencesTerrestrial from './MapWithGeofencesTerrestrial';
const MyMapComponent = ({ vessels, selectedVessel, setVesselEntries }) => {
  const [polygonGeofences, setPolygonGeofences] = useState([]);
  const [polylineGeofences, setPolylineGeofences] = useState([]);
  const [circleGeofences, setCircleGeofences] = useState([]);
  const [terrestrialGeofences, setTerrestrialGeofences] = useState([]);
  const [breakwatersLineGeofences, setBreakwatersLineGeofences] = useState([]);

  const [testTer, setTestTer] = useState([]);
  const [inportTerrestrialGeofences, setInportTerrestrialGeofences] = useState([]);
  const [buttonControl, setButtonControl] = useState(false);
  const [vesselTableData, setVesselTableData] = useState([]);
  const [vesselHistory, setVesselHistory] = useState([]);

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
          axios.get(`${baseURL}/api/polygonTerrestrialGeofences-2`),
         

        ]);
     // Filter the data and set it to terrestrialGeofences
    //  const filteredTerrestrialData = terrestrialRes.data.filter(item => item.geofenceType === "inport");
    //  console.log(filteredTerrestrialData);
    
    //  setTestTer(filteredTerrestrialData);
    //  console.log(terrestrialGeofences);


        setPolygonGeofences(polygonRes.data);
        setPolylineGeofences(polylineRes.data);
        setCircleGeofences(circleRes.data);
        console.log(terrestrialRes.data);
        // setTerrestrialGeofences([]);
        setTerrestrialGeofences(terrestrialRes.data);
      
        console.log(terrestrialGeofences);


        const filteredBreakWatersLineGfs = polylineRes.data.filter(item => item.geofenceType === "breakwaters");
        //  console.log(filteredTerrestrialData);
        setBreakwatersLineGeofences(filteredBreakWatersLineGfs);
       

      } catch (error) {
        console.error('Error fetching geofences:', error);
      }
    };
    fetchGeofences();
  }, []);

  
  useEffect(() => {
    const baseURL = process.env.REACT_APP_API_BASE_URL;
  
    axios.get(`${baseURL}/api/get-vessel-histories`)
      .then((response) => {
        
        const responseData = response.data;
        console.log(responseData);
        setVesselHistory(responseData);

      })
      .catch((err) => {
        console.error("Error fetching vessel data:", err);
        setLoading(false);
      });
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

//KRISHNA START
  // staetr
  // useEffect(() => {
  //   const baseURL = process.env.REACT_APP_API_BASE_URL;
  
  //   axios.get(`${baseURL}/api/get-vessel-histories`)
  //     .then((response) => {
        
  //       const responseData = response.data;
  //       console.log(responseData);
  //       setVesselHistory(responseData);

  //     })
  //     .catch((err) => {
  //       console.error("Error fetching vessel data:", err);
  //       setLoading(false);
  //     });
  // }, []);
  
  
  // const ensureClosedPolygon = (coordinates) => {
  //   if (coordinates.length > 0) {
  //     const firstPoint = coordinates[0];
  //     const lastPoint = coordinates[coordinates.length - 1];
  //     if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
  //       coordinates.push([firstPoint[0], firstPoint[1]]);
  //     }
  //   }
  //   return coordinates;
  // };

  // useEffect(() => {
  //   const checkVesselsInGeofences = () => {
  //     const updatedVesselEntries = {};
  //     vessels.forEach((vessel) => {
  //       const vesselPoint = point([vessel.lng, vessel.lat]);
  //       const overlappingGeofences = []; // To track overlapping geofences with type
  //       let isInsideAnyGeofence = false;
  //       let isInsideWaterBound = false; // To specifically track Water Bound geofence
  
  //       const getCurrentDate = () => new Date().toISOString().split('T')[0];
  
  //       // Polygon geofences
  //       polygonGeofences.forEach((geofence) => {
  //         const geofenceCoordinates = ensureClosedPolygon(
  //           geofence.coordinates.map((coord) => [coord.lat, coord.lng])
  //         );
  //         const geofencePolygon = polygon([geofenceCoordinates]);
  //         const isInside = booleanPointInPolygon(vesselPoint, geofencePolygon);
  
  //         if (isInside) {
  //           overlappingGeofences.push(`${geofence.geofenceName} || ${geofence.geofenceType || 'Polygon'} || ${geofence.seaport || 'Polygon'}`);
  //           isInsideAnyGeofence = true;
  //         }
  //       });
  
  //       // Circle geofences
  //       circleGeofences.forEach((geofence) => {
  //         const { lat, lng, radius } = geofence.coordinates[0];
  //         const distance = turf.distance(vesselPoint, point([lng, lat]), { units: 'meters' });
  //         const isInsideCircle = distance <= radius;
  
  //         if (isInsideCircle) {
  //           overlappingGeofences.push(`${geofence.geofenceName} || ${geofence.geofenceType} ||  ${geofence.seaport} 'Circle'}`);
  //           isInsideAnyGeofence = true;
  //         }
  //       });
  
  //       polylineGeofences.forEach((geofence) => {
  //         const geofenceLine = lineString(geofence.coordinates.map((coord) => [coord.lng, coord.lat]));
  //         const distanceToPolyline = turf.pointToLineDistance(vesselPoint, geofenceLine, { units: 'meters' });
  //         const isNearPolyline = distanceToPolyline <= 3000;
        
  //         if (isNearPolyline) {
  //           overlappingGeofences.push(
  //             `${geofence.geofenceName} (${geofence.geofenceType || 'Polyline'}, Near ${Math.round(distanceToPolyline)} meters)`
  //           );
  //           isInsideAnyGeofence = true;
  //         }
        
  //         // Check for crossing
  //         // const previousVesselPoint = ... // Get the vessel's previous position
  //         // const vesselPath = lineString([previousVesselPoint, vesselPoint]);
        
  //         // const intersection = turf.lineIntersect(vesselPath, geofenceLine);
  //         // if (intersection.features.length > 0) {
  //         //   // Handle crossing (e.g., mark as crossed)
  //         //   console.log(${geofence.geofenceName} has been crossed);
  //         // }
  //       });
        
        
  //       // Water Bound geofences
  //       // WaterBoundGeofence.forEach((geofence) => {
  //       //   const geofenceCoordinates = ensureClosedPolygon(
  //       //     geofence.coordinates.map((coord) => [coord.lat, coord.lng])
  //       //   );
  //       //   const geofencePolygon = polygon([geofenceCoordinates]);
  //       //   const isInside = booleanPointInPolygon(vesselPoint, geofencePolygon);
  
  //       //   if (isInside) {
  //       //     overlappingGeofences.push(`${geofence.geofenceName} || ${geofence.geofenceType || 'Water Bound'}`);
  //       //     isInsideWaterBound = true;
  //       //   }
  //       // });
  
  //       // Update geofence status based on overlaps
  //       if (overlappingGeofences.length > 0) {
  //         const geofenceInsideTime = getCurrentDate();
  //         updatedVesselEntries[vessel.name] = {
  //           entryTime: vesselTableData[vessel.name]?.entryTime || geofenceInsideTime,
  //           geofence: overlappingGeofences.join(' || , '), // Combine overlapping geofence names and types
  //           status:   'Inside',
  //           exitTime: null,
  //         };
  
  //         overlappingGeofences.forEach((geofenceDetail) => {
  //           const geofenceName = geofenceDetail.split(' || ')[0]; // Extract name before type
  //           updateGeofenceInDB(vessel.name, vessel.lat, vessel.lng, geofenceInsideTime, geofenceName, 'Inside');
  //         });
  //       } else if (
  //         !isInsideAnyGeofence &&
  //         (vesselTableData[vessel.name]?.status === 'Inside' || vesselTableData[vessel.name]?.status.includes('Near'))
  //       ) {
  //         // Handle exit scenario
       
  //         updateGeofenceInDB(vessel.name, vessel.lat, vessel.lng, getCurrentDate(), null, 'Outside');
  //       }
  //     });
  
  //     setVesselEntries((prevEntries) => ({
  //       ...prevEntries,
  //       ...updatedVesselEntries,
  //     }));
  //   };
  
  //   if (
  //     vessels.length &&
  //     (polygonGeofences.length || circleGeofences.length || polylineGeofences.length )
  //   ) {
  //     checkVesselsInGeofences();
  //   }
  // }, [vessels, polygonGeofences, circleGeofences, polylineGeofences, setVesselEntries]);

 


  // KRISHNA enddd





  // useEffect(() => {
  //   const checkVesselsInGeofences = () => {
  //     const updatedVesselEntries = {};
  //     vessels.forEach((vessel) => {
  //       const vesselPoint = point([vessel.lng, vessel.lat]);
  //       const overlappingGeofences = []; // To track overlapping geofences with type
  //       let isInsideAnyGeofence = false;
  
  //       const getCurrentDate = () => new Date().toISOString().split('T')[0];
  
  //       // Polygon geofences
  //       polygonGeofences.forEach((geofence) => {
  //         let geofenceCoordinates = geofence.coordinates.map(coord => [coord.lat, coord.lng]);
  //         geofenceCoordinates = ensureClosedPolygon(geofenceCoordinates);
  //         const geofencePolygon = polygon([geofenceCoordinates]);
  //         const isInside = booleanPointInPolygon(vesselPoint, geofencePolygon);
  //         console.log(isInside);
  //         if (isInside) {
  //           overlappingGeofences.push(`${geofence.geofenceName} || ${geofence.geofenceType || 'Polygon'}`);
  //           isInsideAnyGeofence = true;
  //         }

  //         if (isInside) {
  //           if (vesselTableData[vessel.name]?.status !== 'Inside') {
  //             const geofenceInsideTime = getCurrentDate();
  //             updatedVesselEntries[vessel.name] = {
  //               entryTime: vesselTableData[vessel.name]?.entryTime || geofenceInsideTime,
  //               geofence: geofence.geofenceName,
  //               status: 'Inside',
  //               exitTime: null
  //             };
  //             isInsideAnyGeofence = true;
  //             updateGeofenceInDB(vessel.name, vessel.lat, vessel.lng, geofenceInsideTime, geofence.geofenceName, 'Inside');
  //           }
  //         }
  //       });

        
  //       // terrestrial geofences
  //       // terrestrialGeofences.forEach((geofence) => {
  //       //   let geofenceCoordinates = geofence.coordinates.map(coord => [coord.lat, coord.lng]);
  //       //   geofenceCoordinates = ensureClosedPolygon(geofenceCoordinates);
  //       //   const geofencePolygon = polygon([geofenceCoordinates]);
  //       //   const isInside = booleanPointInPolygon(vesselPoint, geofencePolygon);
  
  //       //   if (isInside) {
  //       //     if (vesselTableData[vessel.name]?.status !== 'Inside') {
  //       //       const geofenceInsideTime = getCurrentDate();
  //       //       updatedVesselEntries[vessel.name] = {
  //       //         entryTime: vesselTableData[vessel.name]?.entryTime || geofenceInsideTime,
  //       //         geofence: geofence.geofenceName,
  //       //         status: 'Inside',
  //       //         exitTime: null
  //       //       };
  //       //       isInsideAnyGeofence = true;
  //       //       updateGeofenceInDB(vessel.name, vessel.lat, vessel.lng, geofenceInsideTime, geofence.geofenceName, 'Inside');
  //       //     }
  //       //   }
  //       // });
  
  //       // Circle geofences
  //       circleGeofences.forEach((geofence) => {
  //         const { lat, lng, radius } = geofence.coordinates[0];
  //         const distance = turf.distance(vesselPoint, point([lng, lat]), { units: 'meters' });
  //         const isInsideCircle = distance <= radius;
  
  //         if (isInsideCircle) {
  //           if (vesselTableData[vessel.name]?.status !== 'Inside') {
  //             const geofenceInsideTime = getCurrentDate();
  //             updatedVesselEntries[vessel.name] = {
  //               entryTime: vesselTableData[vessel.name]?.entryTime || geofenceInsideTime,
  //               geofence: geofence.geofenceName,
  //               status: 'Inside',
  //               exitTime: null
  //             };
  //             isInsideAnyGeofence = true;
  //             updateGeofenceInDB(vessel.name, vessel.lat, vessel.lng, geofenceInsideTime, geofence.geofenceName, 'Inside');
  //           }
  //         }
  //       });
  

  // console.log(vessel);
        
  //       // Polyline geofences
  //       polylineGeofences.forEach((geofence) => {
  //         const geofenceLine = lineString(geofence.coordinates.map(coord => [coord.lng, coord.lat]));
  //         const distanceToPolyline = turf.pointToLineDistance(vesselPoint, geofenceLine, { units: 'meters' });
  //         const isNearPolyline = distanceToPolyline <= 3000;
  //         if (isNearPolyline) {
  //           overlappingGeofences.push(
  //             `${geofence.geofenceName} (${geofence.geofenceType || 'Polyline'}, Near ${Math.round(distanceToPolyline)} meters)`
  //           );
  //           isInsideAnyGeofence = true;
  //         }

  // console.log(vessel);

  //           // start

  //       // Check for crossing
    
  //       const historydata = vesselHistory.filter((item) => item.IMO === vessel.imo);
  //       if (historydata.length === 0) {
  //         console.error("No history data found for IMO:", vessel.imo);
  //         return;
  //       }

  //       const history = historydata[0]?.history;
  //       if (!history || history.length === 0) {
  //         console.error("History is undefined or empty for IMO:", vessel.imo);
  //         return;
  //       }

  //       const lastPosition = history[history.length - 2];
  //       const previousVesselPoint = [lastPosition.LONGITUDE, lastPosition.LATITUDE];
  //       console.log(previousVesselPoint);
  //       if (!previousVesselPoint[0] || !previousVesselPoint[1]) {
  //         console.error("Previous vessel point data is missing");
  //         return;
  //       }
  //       // console.log(vessel.lng, vessel.lat);

  //       const currentLocationPoint = [vessel.lng, vessel.lat];
  //       const vesselPath = turf.lineString([previousVesselPoint, currentLocationPoint]);
  //       // console.log(vesselPath);
  //       const intersection = turf.lineIntersect(vesselPath, geofenceLine);
  //       // console.log(intersection);


  //       if (intersection.features.length > 0) {
  //         console.log(`${geofence.geofenceName} has been crossed`);
  //       }
    
      
  //       // if (intersection.features.length > 0) {
  //       //   if (!updatedVesselEntries[vessel.name] || !updatedVesselEntries[vessel.name].status.includes('Near')) {
  //       //     updatedVesselEntries[vessel.name] = {
  //       //       entryTime: vesselTableData[vessel.name]?.entryTime || getCurrentDate(),
  //       //       geofence: geofence.geofenceName,
  //       //       status: `${geofence.geofenceName} has been crossed `,
  //       //       exitTime: null
  //       //     };
  //       //     isInsideAnyGeofence = true;
           

  //       //     updateGeofenceInDB(vessel.name, vessel.lat, vessel.lng, getCurrentDate(), geofence.geofenceName, 'Near');
  //       //   }
  //       // }


  //       // end





  // if (intersection.features.length > 0) {
  //   if (!updatedVesselEntries[vessel.name] || !updatedVesselEntries[vessel.name].status.includes('Near')) {
  //     updatedVesselEntries[vessel.name] = {
  //       entryTime: vesselTableData[vessel.name]?.entryTime || getCurrentDate(),
  //       geofence: geofence.geofenceName,
  //       status: `${geofence.geofenceName} has been crossed `,
  //       exitTime: null
  //     };
  //     isInsideAnyGeofence = true;
     

  //     updateGeofenceInDB(vessel.name, vessel.lat, vessel.lng, getCurrentDate(), geofence.geofenceName, 'Near');
  //   }
  // } else   if (isNearPolyline) {
  //           if (!updatedVesselEntries[vessel.name] || !updatedVesselEntries[vessel.name].status.includes('Near')) {
  //             updatedVesselEntries[vessel.name] = {
  //               entryTime: vesselTableData[vessel.name]?.entryTime || getCurrentDate(),
  //               geofence: geofence.geofenceName,
  //               status: `Near ${Math.round(distanceToPolyline)} meters`,
  //               exitTime: null
  //             };
  //             isInsideAnyGeofence = true;
             

  //             updateGeofenceInDB(vessel.name, vessel.lat, vessel.lng, getCurrentDate(), geofence.geofenceName, 'Near');
  //           }
  //         }


      


  //       });

        


  // //       // start

  // //       // Check for crossing
  //       // const historydata = vesselHistory.filter((item) => item.IMO === vessel.imo);
  //       // if (historydata.length === 0) {
  //       //   console.error("No history data found for IMO:", vessel.imo);
  //       //   return;
  //       // }

  //       // const history = historydata[0]?.history;
  //       // if (!history || history.length === 0) {
  //       //   console.error("History is undefined or empty for IMO:", vessel.imo);
  //       //   return;
  //       // }

  //       // const lastPosition = history[history.length - 2];
  //       // const previousVesselPoint = [lastPosition.LONGITUDE, lastPosition.LATITUDE];
  //       // console.log(previousVesselPoint);
  //       // if (!previousVesselPoint[0] || !previousVesselPoint[1]) {
  //       //   console.error("Previous vessel point data is missing");
  //       //   return;
  //       // }
  //       // console.log(vessel.lng, vessel.lat);

  //       // const currentLocationPoint = [vessel.lng, vessel.lat];
  //       // const vesselPath = turf.lineString([previousVesselPoint, currentLocationPoint]);
  //       // console.log(vesselPath);
  //       // const intersection = turf.lineIntersect(vesselPath, geofenceLine);
  //       // console.log(intersection);


  //       // if (intersection.features.length > 0) {
  //       //   console.log(`${geofence.geofenceName} has been crossed`);
  //       // }
    
      
  // //       // end



  
  //       // Check for exit status
  //       if (!isInsideAnyGeofence && (vesselTableData[vessel.name]?.status === 'Inside' || vesselTableData[vessel.name]?.status.includes('Near'))) {
  //         updatedVesselEntries[vessel.name] = {
  //           status: 'Outside',
  //           exitTime: getCurrentDate()
  //         };
  //         updateGeofenceInDB(vessel.name, vessel.lat, vessel.lng, getCurrentDate(), null, 'Outside');
  //       }
  //     });
  
  //     setVesselEntries((prevEntries) => ({
  //       ...prevEntries,
  //       ...updatedVesselEntries
  //     }));
  //   };
  
  //   if (vessels.length && (polygonGeofences.length || circleGeofences.length || polylineGeofences.length )) {
  //     checkVesselsInGeofences();
  //   }
  // }, [vessels, polygonGeofences, circleGeofences, polylineGeofences, setVesselEntries]);
  





  // ...
 

  useEffect(() => {
    const checkVesselsInGeofences = () => {
      const updatedVesselEntries = {};
      vessels.forEach((vessel) => {
        const vesselPoint = point([vessel.lng, vessel.lat]);
        console.log(vesselPoint);

        if (!vesselPoint.geometry.coordinates || vesselPoint.geometry.coordinates.length !== 2) {
          console.error("Invalid vessel coordinates:", vessel.lng, vessel.lat);
          return;
        }


        const overlappingGeofences = []; // To track overlapping geofences with type
        const overlappingStatus = []; 
        let isInsideAnyGeofence = false;
        // let isInsideWaterBound = false; // To specifically track Water Bound geofence
  
        const getCurrentDate = () => new Date().toISOString().split('T')[0];
  
        // Polygon geofences
        polygonGeofences.forEach((geofence) => {
          const geofenceCoordinates = ensureClosedPolygon(
            geofence.coordinates.map((coord) => [coord.lat, coord.lng])
          );
          const geofencePolygon = polygon([geofenceCoordinates]);
          const isInside = booleanPointInPolygon(vesselPoint, geofencePolygon);
  
          if (isInside) {
            overlappingGeofences.push(`Inside ${geofence.geofenceName} || ${geofence.geofenceType ||  '-'} || ${geofence.seaport}`);
            isInsideAnyGeofence = true;
          }
        });
  
        // Circle geofences
        circleGeofences.forEach((geofence) => {
          const { lat, lng, radius } = geofence.coordinates[0];
          const distance = turf.distance(vesselPoint, point([lng, lat]), { units: 'meters' });
          const isInsideCircle = distance <= radius;
  
          if (isInsideCircle) {
            overlappingGeofences.push(`Inside ${geofence.geofenceName} || ${geofence.geofenceType || '-'} || ${geofence.seaport} `);
            isInsideAnyGeofence = true;
          }
        });
  
        polylineGeofences.forEach((geofence) => {
          const geofenceLine = lineString(geofence.coordinates.map((coord) => [coord.lat, coord.lng]));
          const distanceToPolyline = turf.pointToLineDistance(vesselPoint, geofenceLine, { units: 'meters' });

          const isNearPolyline = distanceToPolyline <= 3000;
        
          // if (isNearPolyline) {
          //   overlappingGeofences.push(`
          //     ${geofence.geofenceName} (${geofence.geofenceType || 'Polyline'}, Near ${Math.round(distanceToPolyline)} meters)
          //   `);
          //   isInsideAnyGeofence = true;
          // }
        
   
         
          
 // Check for crossing
 const historydata = vesselHistory.filter((item) => item.IMO === vessel.imo);
 if (historydata.length === 0) {
   console.error("No history data found for IMO:", vessel.imo);
   return;
 }

 const history = historydata[0]?.history;
 if (!history || history.length === 0) {
   console.error("History is undefined or empty for IMO:", vessel.imo);
   return;
 }

 let lastPosition;

 if (history.length >= 2) {
   lastPosition = history[history.length - 2];
 } else {
   lastPosition = null; // Or simply leave it undefined if no value is needed
 }
 

 let previousVesselPoint;
 
 if (lastPosition && lastPosition.LONGITUDE !== undefined && lastPosition.LATITUDE !== undefined) {
  previousVesselPoint = [lastPosition.LATITUDE, lastPosition.LONGITUDE];
 } else {
  // console.error("Previous position data is invalid.");
  
}


//  console.log(previousVesselPoint);
 

// Check if previousVesselPoint is valid before proceeding
if (!previousVesselPoint || previousVesselPoint[0] === undefined || previousVesselPoint[1] === undefined) {
  // console.error("Previous vessel point data is missing");
  return; // Don't proceed further if data is missing
}


//  console.log(vessel.lng, vessel.lat);

 const currentLocationPoint = [vessel.lat, vessel.lng];
//  console.log(currentLocationPoint);

 const vesselPath = turf.lineString([previousVesselPoint, currentLocationPoint]);
//  console.log(vesselPath);
//  console.log(geofenceLine);

 let intersection;

 if( vesselPath && geofenceLine ){

   intersection = turf.lineIntersect(vesselPath, geofenceLine);

 }


       if (intersection.features.length > 0) {
         console.log(intersection,vessel);
           //   overlappingGeofences.push(`
          //     ${geofence.geofenceName} (${geofence.geofenceType || 'Polyline'}, Near ${Math.round(distanceToPolyline)} meters)
          //   `);
          //   isInsideAnyGeofence = true;
    if (!updatedVesselEntries[vessel.name] || !updatedVesselEntries[vessel.name].status.includes('Near')) {
     updatedVesselEntries[vessel.name] = {
       entryTime: vesselTableData[vessel.name]?.entryTime || getCurrentDate(),
       geofence: `Crossed ${geofence.geofenceName} || ${geofence.geofenceType} `,
       status: `Crossed `,
       exitTime: null
     };
     isInsideAnyGeofence = true;
           

     updateGeofenceInDB(vessel.name, vessel.lat, vessel.lng, getCurrentDate(), geofence.geofenceName, 'Near');
   }
 }





        });
        
       


        // Water Bound geofences
        // WaterBoundGeofence.forEach((geofence) => {
        //   const geofenceCoordinates = ensureClosedPolygon(
        //     geofence.coordinates.map((coord) => [coord.lat, coord.lng])
        //   );
        //   const geofencePolygon = polygon([geofenceCoordinates]);
        //   const isInside = booleanPointInPolygon(vesselPoint, geofencePolygon);
  
        //   if (isInside) {
        //     overlappingGeofences.push(`${geofence.geofenceName} || ${geofence.geofenceType || 'Water Bound'}`);
        //     isInsideWaterBound = true;
        //   }
        // });
  

        

          


        // Update geofence status based on overlaps
        if (overlappingGeofences.length > 0) {
          const geofenceInsideTime = getCurrentDate();
          updatedVesselEntries[vessel.name] = {
            entryTime: vesselTableData[vessel.name]?.entryTime || geofenceInsideTime,
            geofence: overlappingGeofences.join(' , '), // Combine overlapping geofence names and types
            status:  'Inside',
            exitTime: null,
          };
  
          overlappingGeofences.forEach((geofenceDetail) => {
            const geofenceName = geofenceDetail.split(' || ')[0]; // Extract name before type
            updateGeofenceInDB(vessel.name, vessel.lat, vessel.lng, geofenceInsideTime, geofenceName, 'Inside');
          });
        } else if (
          !isInsideAnyGeofence &&
          (vesselTableData[vessel.name]?.status === 'Inside' || vesselTableData[vessel.name]?.status.includes('Near'))
        ) {
          // Handle exit scenario
          updatedVesselEntries[vessel.name] = {
            status:'Outside',
            exitTime: getCurrentDate(),
          };
          updateGeofenceInDB(vessel.name, vessel.lat, vessel.lng, getCurrentDate(), null, 'Outside');
        }


         // terrestrial inport type geofences
         terrestrialGeofences.forEach((geofence) => {

console.log(geofence);
           
          const geofenceCoordinates = ensureClosedPolygon(
            geofence.coordinates.map((coord) => [coord.lat, coord.lng])
          );
          const geofencePolygon = polygon([geofenceCoordinates]);
          const isInside = booleanPointInPolygon(vesselPoint, geofencePolygon);
  // .....
//    // checking INBOUND

//    console.log(isInside);

          if (isInside) {
            // ..
            breakwatersLineGeofences.forEach((linegeofence) => {
              const geofenceLine = lineString(linegeofence.coordinates.map((coord) => [coord.lng, coord.lat]));
              const distanceToPolyline = turf.pointToLineDistance(vesselPoint, geofenceLine, { units: 'meters' });
              const isNearPolyline = distanceToPolyline <= 3000;
            
              // if (isNearPolyline) {
              //   overlappingGeofences.push(`
              //     ${linegeofence.geofenceName} (${linegeofence.geofenceType || 'Polyline'}, Near ${Math.round(distanceToPolyline)} meters)
              //   `);
              //   isInsideAnyGeofence = true;
              // }
            
       
             
              
     // Check for crossing
     const historydata = vesselHistory.filter((item) => item.IMO === vessel.imo);
     if (historydata.length === 0) {
       console.error("No history data found for IMO:", vessel.imo);
       return;
     }
    
     const history = historydata[0]?.history;
     if (!history || history.length === 0) {
       console.error("History is undefined or empty for IMO:", vessel.imo);
       return;
     }
    
     let lastPosition;
     let previousVesselPoint;

 if (history.length >= 2) {
   lastPosition = history[history.length - 2];
   previousVesselPoint = [lastPosition.LONGITUDE, lastPosition.LATITUDE];
 
 }


 

     console.log(previousVesselPoint);
     if (!previousVesselPoint[0] || !previousVesselPoint[1]) {
       console.error("Previous vessel point data is missing");
       return;
     }

     console.log(vessel.lng, vessel.lat);
     
     let currentLocationPoint = [vessel.lng, vessel.lat];
     let vesselPath = turf.lineString([previousVesselPoint, currentLocationPoint]);
     console.log(vesselPath);
     let intersection = turf.lineIntersect(vesselPath, geofenceLine);
     console.log(intersection);

     if (intersection.features.length === 0) {
      // No intersection found, fall back to the previous history position if possible
      if (history.length >= 3) {
        lastPosition = history[history.length - 3];  // Check the previous-to-last position
        previousVesselPoint = [lastPosition.LONGITUDE, lastPosition.LATITUDE];
        vesselPath = turf.lineString([previousVesselPoint, currentLocationPoint]);
        console.log(vesselPath);
        intersection = turf.lineIntersect(vesselPath, geofenceLine);
        console.log(intersection);
    
    
      }
     
      else {
        console.error('No fallback position found');
      }
  
      
    }

    // when intersects ,it means its crossed the 
           if (intersection.features.length > 0) {
            console.log('inbounnnnnnnnnd',vessel);
            overlappingGeofences.push(` Crossed ${linegeofence.geofenceName} || ${linegeofence.geofenceType || '-'} `);
            isInsideAnyGeofence = true;
            console.log(overlappingGeofences);
            if (overlappingGeofences.length > 0) {
              const geofenceInsideTime = getCurrentDate();
              updatedVesselEntries[vessel.name] = {
                entryTime: vesselTableData[vessel.name]?.entryTime || geofenceInsideTime,
                geofence: overlappingGeofences.join(' , '), // Combine overlapping geofence names and types
                status:  `INBOUND - ${geofence.geofenceName}`,
                exitTime: null,
              };
      
              overlappingGeofences.forEach((geofenceDetail) => {

                console.log('inbounnnnnnnnnd');
                const geofenceName = geofenceDetail.split(' || ')[0]; // Extract name before type
                updateGeofenceInDB(vessel.name, vessel.lat, vessel.lng, geofenceInsideTime, geofenceName, 'INBOUND');
              });
            }

      //   if (!updatedVesselEntries[vessel.name] || !updatedVesselEntries[vessel.name].status.includes('Near')) {
      //    updatedVesselEntries[vessel.name] = {
      //      entryTime: vesselTableData[vessel.name]?.entryTime || getCurrentDate(),
      //      geofence: geofence.geofenceName,
      //       status: `${geofence.geofenceName} has been crossed `,
      //      exitTime: null
      //    };
      //    isInsideAnyGeofence = true;
               
    
      //    updateGeofenceInDB(vessel.name, vessel.lat, vessel.lng, getCurrentDate(), geofence.geofenceName, 'Near');
      //  }
     }
    
    
    
    
    
            });
            // .. 
          
          } 

          // checking OUTBOUND
          if(!isInside){

                 const historydata = vesselHistory.filter((item) => item.IMO === vessel.imo);
                if (historydata.length === 0) {
                  console.error("No history data found for IMO - outbound check:", vessel.imo);
                  return;
                }
        
                const history = historydata[0]?.history;
                if (!history || history.length === 0) {
                  console.error("History is undefined or empty for IMO - outbound check:", vessel.imo);
                  return;
                }
        
                let lastPosition;

 if (history.length >= 3) {
   lastPosition = history[history.length - 2];
 } else {
   lastPosition = null; // Or simply leave it undefined if no value is needed
 }
 let previousVesselPoint;
 if (lastPosition && lastPosition.LONGITUDE !== undefined && lastPosition.LATITUDE !== undefined) {
                 previousVesselPoint = point([lastPosition.LONGITUDE, lastPosition.LATITUDE]);
 } else {
  console.error("Invalid / unavailable lastPosition data:", lastPosition);
  return;
}
              
                  // if (!previousVesselPoint[0] || !previousVesselPoint[1]) {
                  //   console.error("Previous vessel point data is missing");
                  //   return;
                  // }

                  
                  if (!previousVesselPoint || !previousVesselPoint.geometry || previousVesselPoint.geometry.coordinates.length !== 2) {
                    console.error("Previous vessel point data is invalid:", previousVesselPoint);
                    return;
                  }
                  
                console.log(previousVesselPoint);
                console.log(geofencePolygon);
    
              
                const isPreviousPointInside = booleanPointInPolygon(previousVesselPoint, geofencePolygon);
                console.log(isPreviousPointInside);

                if (isPreviousPointInside) {

                  breakwatersLineGeofences.forEach((linegeofence) => {
                    const geofenceLine = lineString(linegeofence.coordinates.map((coord) => [coord.lng, coord.lat]));
                    const distanceToPolyline = turf.pointToLineDistance(vesselPoint, geofenceLine, { units: 'meters' });
                    const isNearPolyline = distanceToPolyline <= 3000;
                  
                    // if (isNearPolyline) {
                    //   overlappingGeofences.push(`
                    //     ${linegeofence.geofenceName} (${linegeofence.geofenceType || 'Polyline'}, Near ${Math.round(distanceToPolyline)} meters)
                    //   `);
                    //   isInsideAnyGeofence = true;
                    // }
                  
             
                   
                    
           // Check for crossing
           const historydata = vesselHistory.filter((item) => item.IMO === vessel.imo);
           if (historydata.length === 0) {
             console.error("No history data found for IMO:", vessel.imo);
             return;
           }
          
           const history = historydata[0]?.history;
           if (!history || history.length === 0) {
             console.error("History is undefined or empty for IMO:", vessel.imo);
             return;
           }
          
           let lastPosition;

 if (history.length >= 2) {
   lastPosition = history[history.length - 2];
 } else {
   lastPosition = null; // Or simply leave it undefined if no value is needed
 }

 let previousVesselPoint;
 if (lastPosition && lastPosition.LONGITUDE !== undefined) {
            previousVesselPoint = [lastPosition.LONGITUDE, lastPosition.LATITUDE];
 }
 
           console.log(previousVesselPoint);
           if (!previousVesselPoint[0] || !previousVesselPoint[1]) {
             console.error("Previous vessel point data is missing");
             return;
           }
           console.log(vessel.lng, vessel.lat);
          
           const currentLocationPoint = [vessel.lng, vessel.lat];
           const vesselPath = turf.lineString([previousVesselPoint, currentLocationPoint]);
           console.log(vesselPath);
           const intersection = turf.lineIntersect(vesselPath, geofenceLine);
           console.log(intersection);
          // when intersects ,it means its crossed the 
                 if (intersection.features.length > 0) {
                  console.log('outbounddd');
                  overlappingGeofences.push(`Crossed ${linegeofence.geofenceName} || ${linegeofence.geofenceType || '-'}`);
                  isInsideAnyGeofence = true;
                  console.log(overlappingGeofences);
                  if (overlappingGeofences.length > 0) {
                    const geofenceInsideTime = getCurrentDate();
                    updatedVesselEntries[vessel.name] = {
                      entryTime: vesselTableData[vessel.name]?.entryTime || geofenceInsideTime,
                      geofence: overlappingGeofences.join(' , '), // Combine overlapping geofence names and types
                      status:  `OUTBOUND - ${geofence.geofenceName}`,
                      exitTime: null,
                    };
            
                    overlappingGeofences.forEach((geofenceDetail) => {
      
                      console.log('outbounnnnnnnnnd');
                      const geofenceName = geofenceDetail.split(' || ')[0]; // Extract name before type
                      updateGeofenceInDB(vessel.name, vessel.lat, vessel.lng, geofenceInsideTime, geofenceName, 'OUTBOUND');
                    });
                  }
      
          
           }
          
          
          
          
          
                  });
                } 

          }



     



 // .....
        });

      });
  
      setVesselEntries((prevEntries) => ({
        ...prevEntries,
        ...updatedVesselEntries,
      }));
    };
  
    if (
      vessels.length &&
      (polygonGeofences.length || circleGeofences.length || polylineGeofences.length )
    ) {
      checkVesselsInGeofences();
    }
  }, [vessels, polygonGeofences, circleGeofences, polylineGeofences, setVesselEntries]);

  // ....
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
      <div className="checkbox-container">
        <label className="checkbox-label">
          <input type="checkbox" checked={buttonControl} onChange={handleButtonControl} />
          Draw Mode
        </label>
      </div>

      <MapContainer center={[0, 0]} minZoom={1.5} zoom={1.5} maxZoom={18} 
                    maxBounds={[[85, -180], [-85, 180]]} // Strict world bounds to prevent panning
                    maxBoundsViscosity={8} // Makes the map rigid
                   style={{ height: '55vh', width: '100%', backgroundColor: 'rgba(170,211,223,255)'}}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" noWrap={true} />
        <MapWithMarkers vessels={vessels} selectedVessel={selectedVessel} />
        {/* <MapWithPorts ports={ports} /> */}

        <MapWithFullscreen />
        {buttonControl && <MapWithDraw />}
        <MapWithGeofences geofences={polygonGeofences} />
        <MapWithPolylineGeofences geofences={polylineGeofences} />
        <MapWithCircleGeofences geofences={circleGeofences} />
        <MapWithGeofencesTerrestrial geofences={terrestrialGeofences} />
        <MeasureControl/>
      </MapContainer>
    </>
  );
};

MyMapComponent.propTypes = {
  vessels: PropTypes.arrayOf(
    PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
      name: PropTypes.string,
      imo: PropTypes.number,
      heading: PropTypes.number,
      eta: PropTypes.string,
      destination: PropTypes.string,
    }).isRequired
  ).isRequired,
  selectedVessel: PropTypes.shape({
    name: PropTypes.string.isRequired,
    imo: PropTypes.number,
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    heading: PropTypes.number,
  }),
  setVesselEntries: PropTypes.func.isRequired,
};

export default MyMapComponent;


