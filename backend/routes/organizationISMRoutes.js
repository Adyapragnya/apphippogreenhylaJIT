import express from 'express';
import CryptoJS from 'crypto-js';
import OrganizationISM from '../models/OrganizationISM.js'; 
import SalesISM from '../models/SalesISM.js'; 
import SalesRadar from '../models/SalesRadar.js'; 
import mongoose from 'mongoose';
import axios from 'axios';
import AisSatPullFleet from '../models/AisSatPullFleet.js';
import LoginUsers from '../models/LoginUsers.js'; 
import * as turf from '@turf/turf';
import TrackedVessel from '../models/TrackedVessel.js'; 
import TrackedVesselISM from '../models/TrackedVesselISM.js'; 
const reactAPI = process.env.REACT_APP_API_BASE_URL;

import EmailOptionsTosend from '../models/EmailOptionsTosend.js'; 

import path from 'path'; // Import the path module


import TerrestrialGeofence from '../models/TerrestrialGeofence.js';


import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Vessel from '../server.js'

import multer from 'multer';

const storage = multer.memoryStorage(); // or diskStorage depending on where you want to store files
const upload = multer({ storage: storage });

const router = express.Router();

// Counter model for managing orgId sequences
const counterISMOrgSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // This will hold the collection name
  seq: { type: Number, default: 5555 } // Start from 555
});

const CounterIsmOrg = mongoose.model('counterISMOrg', counterISMOrgSchema  , 'counterISMOrg');

// Function to get the next sequence number for orgId
const getNextSequence = async (seqName) => {
  const sequenceDocument = await CounterIsmOrg.findByIdAndUpdate(
    { _id: seqName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true } // Create if it doesn't exist
  );

  return sequenceDocument.seq;
};

// Function to reset the counter to start from 555
const resetCounter = async () => {
  await CounterIsmOrg.findByIdAndUpdate(
    { _id: 'orgId' },
    { seq: 5555 },
    { upsert: true }
  );
};

// master starts






// master ends


router.post('/create', upload.none() ,  async (req, res) => {
    console.log(req.body);
    const {companyTitle, companyName, address } = req.body;
  
    if (!companyTitle || !companyName || !address ) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    companyTitle, companyName, address
  
    try {
      const organizationCount = await OrganizationISM.countDocuments();
      if (organizationCount === 0) {
        await resetCounter();
      }
  
    await OrganizationISM.findOneAndUpdate(
        {},
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
  
     
  
    
  
      const orgseq = await getNextSequence('orgId') ;
      const orgId = `ORG${orgseq}`;
  
     
      const newOrganization = new OrganizationISM({
        orgId,
        companyTitle,
        companyName,
        address,
        
      });
  
      await newOrganization.save();
  
  
      res.status(201).json({ message: 'ISM Organization created' });
    } catch (error) {
    
      console.error('Error creating ISM organization:', error);
      res.status(500).json({ message: 'Error creating ISM organization .', error: error.message });
    }
  });
 

  router.get('/get-ISM-organizations', async (req, res) => {
    try {
        
        const ismOrganizations = await OrganizationISM.find();
       
  
        res.json(ismOrganizations);
    } catch (error) {
        console.error('Error fetching ISM data:', error);
        res.status(500).json({ error: 'Error fetching ISM data' });
    }
  });

  router.get('/get-view-ISM-organizations', async (req, res) => {
    try {
      // Fetch all organizations from OrganizationISM
      const ismOrganizations = await OrganizationISM.find();
  
      // Prepare an array to hold the final result
      const result = [];
  
      // Iterate through each organization and add fleet count and updated date
      for (const org of ismOrganizations) {
        const { companyTitle, orgId, companyName, address } = org;
  
        // Get fleet count: Count SalesISM documents with matching companyTitle
        const fleetCount = await SalesISM.countDocuments({ OrgId: orgId });
  
        // Get the latest updated date: Find the most recent createdAt for matching companyTitle in SalesISM
        const latestSalesDoc = await SalesISM.findOne({ OrgId: orgId })
          .sort({ createdAt: -1 })
          .select('createdAt');
  
        const updatedDate = latestSalesDoc ? latestSalesDoc.createdAt : null;
  
        // Push the final result object into the result array
        result.push({
          orgId,
          companyTitle,
          companyName,
          address,
          fleetCount,
          updatedDate
        });
      }
  
      // Send the result to the frontend
      res.json(result);
  
    } catch (error) {
      console.error('Error fetching ISM data:', error);
      res.status(500).json({ error: 'Error fetching ISM data' });
    }
  });

//   
router.post('/upload-individual-ism-data', async (req, res) => {
try {
    // Extract data from request body
    const {
      OrgId,
      CompanyTitle,
      IMO,
      VesselName,
      GrossTonnage,
      ShipType,
      YearOfBuild,
      CurrentFlag,
      CurrentClass,
      ManagementOffice,
    } = req.body;

    // Create a new SalesISM document using the data
    const newSalesISM = new SalesISM({
      OrgId,
      CompanyTitle,
      IMO,
      VesselName,
      GrossTonnage,
      ShipType,
      YearOfBuild,
      CurrentFlag,
      CurrentClass,
      ManagementOffice,
    });

    // Save the new document to the database
    await newSalesISM.save();

    // Send a success response
    res.status(201).json({
      message: 'SalesISM data saved successfully!',
      data: newSalesISM,
    });
  } catch (error) {
    // Handle any errors
    console.error('Error saving data:', error);
    res.status(500).json({
      message: 'Error saving SalesISM data',
      error: error.message,
    });
  }
});



router.post('/upload-ism-data', async (req, res) => {
    try {
      const data = req.body; // Get the sales data from the request
      const imoNumbers = data.map(row => row.IMO); // Extract IMO numbers from the data
      let foundImos = [];
      let notFoundImos = [];
      const errorMessages = [];
      const successCount = [];
      const failureCount = [];
      const userTrackedData = []; // Array to store user-tracked vessel data
      
      // Extract user details from the first row (assuming all rows have the same user context)
      const { OrgId, CompanyTitle } = data[0]; 
  
      // Check which IMOs exist in the TrackedVessel collection
      const trackedVessels = await TrackedVessel.find({ IMO: { $in: imoNumbers } }).select('IMO');
      const trackedImos = trackedVessels.map(vessel => vessel.IMO);
      
      // Separate found and not found IMOs
      for (const imo of imoNumbers) {
        if (trackedImos.includes(imo)) {
          foundImos.push(imo);
        } else {
          notFoundImos.push(imo);
        }
      }
  
      // Remove duplicates 
      notFoundImos = [...new Set(notFoundImos)];

      foundImos = [...new Set(foundImos)];
  
      // case:1 - copy document from TrackedVessel to TrackedVesselISM
      const bulkUpload = [];  // Array to hold bulk operations

      for (const imo of foundImos) {
        try {
          // Find the document from TrackedVessel collection using the IMO
          const vessel = await TrackedVessel.findOne({ IMO: imo });
      
          if (vessel) {
            // Prepare the operation for bulkWrite
            bulkUpload.push({
              updateOne: {
                filter: { IMO: imo },
                update: { 
                  $setOnInsert: { ...vessel.toObject(), updatedAt: undefined } // Ensure `updatedAt` is not set
                },
                upsert: true,  // This will insert the document if it doesn't exist
              },
            });
          }
        } catch (error) {
          console.error(`Error processing IMO ${imo}:`, error.message);
          errorMessages.push(`Error processing IMO ${imo}: ${error.message}`);
          failureCount.push(imo);
        }
      }
      
      // If there are any bulk operations, execute them
      if (bulkUpload.length > 0) {
        try {
          // Execute the bulk operations
          const result = await TrackedVesselISM.bulkWrite(bulkUpload);
          console.log(`Bulk write completed with ${result.nUpserted} documents inserted`);
        } catch (error) {
          console.error('Error performing bulk insert:', error.message);
          // Respond with an error only once
          if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to upload data to TrackedVesselISM from trackedvessels' });
          }
        }
      }
      
      let userkey = '';
      // case:2 -  Process not found IMOs and add them as new tracked vessels
      for (const imo of notFoundImos) {

        const vessel = await TrackedVesselISM.findOne({ IMO: imo });
       
        try {
            if(!vessel){ 
            try {
                const emailOption = await AisSatPullFleet.findOne({});
                if (emailOption) {
                  
                    userkey=emailOption.aisuserkey;
                  
                } 
            } catch (error) {
                console.error('Error loading email credentials:', error);
            }



          // Fetch vessel details from Vessel collection
          const vesselData = await Vessel.findOne({ imoNumber: imo }).select(
            "SpireTransportType FLAG GrossTonnage deadWeight"
          );
        

          if (!vesselData) {
            const errorMessage = `Vessel with IMO ${imo} not found in vessel_master`;
            console.error(errorMessage);
            errorMessages.push(errorMessage);
            failureCount.push(imo);
            continue;
          }
          
          // Fetch AIS data
          const aisResponse = await axios.get("https://api.vtexplorer.com/vessels", {
            params: { userkey, imo, format: "json", sat: "1" },
          });
       

          const aisDataArray = aisResponse.data;
          
          if (!aisDataArray || aisDataArray.length === 0) {
            const errorMessage = `AIS data not found for IMO ${imo}`;
            console.error(errorMessage);
            errorMessages.push(errorMessage);
            failureCount.push(imo);
            continue;
          }
          
          
          const currentTime = new Date();
          const aisData = aisDataArray[0].AIS;
          const newTrackedVesselISM = new TrackedVesselISM({
            IMO: imo,
            AIS: { ...aisData },
            SpireTransportType: vesselData.SpireTransportType,
            FLAG: vesselData.FLAG,
            GrossTonnage: vesselData.GrossTonnage,
            deadWeight: vesselData.deadWeight,
            trackingFlag: true,
            lastFetchTime: currentTime,
            GeofenceStatus: null,
            geofenceFlag: null,
            GeofenceInsideTime: null,
            AisPullGfType: null,
          });
        
          await newTrackedVesselISM.save();
          successCount.push(imo);
       } } catch (error) {
          console.error(`Error adding IMO vessel to fleet vessels ${imo}:`, error.message);
          errorMessages.push(`Error processing IMO ${imo}: ${error.message}`);
          failureCount.push(imo);
        }
      
    }
  
  
  
  
  
     // Save the fleet data
     let savedDocuments = [];
     for (const row of data) {
  
      try{

          
  
        // Save the new document to SalesISM
        const newFleet = new SalesISM({
        
          OrgId: OrgId,
          CompanyTitle : CompanyTitle,

          IMO: row.IMO,
          VesselName: row.VesselName,
          GrossTonnage : row.GrossTonnage,
          ShipType : row.ShipType,
          YearOfBuild : row.YearOfBuild,
          CurrentFlag : row.CurrentFlag,
          CurrentClass : row.CurrentClass,
          ManagementOffice : row.ManagementOffice
       
        });
        const savedFleet = await newFleet.save();
        savedDocuments.push(savedFleet);
  
 
  
  } catch (error) {
    console.error('Error saving fleet data:', error);
    res.status(500).json({ error: 'Failed to upload fleet data' });
    return;
  }
    }
  
      // Response with details
      res.status(200).json({
        message: "Fleet Data uploaded successfully",
        savedDocuments,
        foundImos,
        notFoundImos,
        successCount,
        failureCount,
        errorMessages,
        userTrackedData, // Include user tracking data in the response
      });
    } catch (error) {
      console.error('Error uploading fleet data:', error);
      res.status(500).json({ error: 'Failed to fleet data' });
    }
  });

// 
router.get('/get-whole-ISM-data', async (req, res) => {
    try {
        const data = await SalesISM.find({});

   
    res.json( data );

  } catch (error) {
    console.error('Error fetching fleet data:', error);
    res.status(500).json({ error: 'Error fetching fleet data' });
  }
});

router.delete('/delete-fleet/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await SalesISM.findByIdAndDelete(id); // Delete by document ID
      res.status(200).json({ message: 'Fleet data deleted successfully' });
    } catch (error) {
      console.error('Error deleting fleet data:', error);
      res.status(500).json({ error: 'Error deleting fleet data' });
    }
  });
  
  
router.get('/get-ISM-data', async (req, res) => {
    try {
      const { role, id } = req.query;
      
        // Fetch SalesISM data
    const ismData = await SalesISM.find({}, 'CompanyTitle VesselName IMO ShipType GrossTonnage CurrentFlag CurrentClass ManagementOffice');

    // Fetch all TrackedVesselISM data
    const vesselData = await TrackedVesselISM.find({ IMO: { $in: ismData.map((vessel) => vessel.IMO) } }, 'IMO AIS AisPullGfType');

    // Create a map of IMO to region for easier lookup
    const imoToRegionMap = vesselData.reduce((acc, vessel) => {
      acc[vessel.IMO] = vessel.AisPullGfType;
      return acc;
    }, {});

   

    const imoToAisMap = vesselData.reduce((acc, vessel) => {
      acc[vessel.IMO] = vessel.AIS;
      return acc;
    }, {});


    // Fetch SalesRadar data
    let salesRadarData = await SalesRadar.find();

    // If the role is not 'hyla admin', filter the salesRadarData based on OrgId
    if (role === 'organization admin' || role === 'organizational user') {
      const extractOrgPart = (value) => {
        let orgId = value.includes('_') ? value.split('_')[1] : value.split('_')[0];
        return orgId;
      };

      // Filter SalesRadar data based on the OrgId extracted from the `id` query parameter
      salesRadarData = salesRadarData.filter((entry) => entry.OrgId === extractOrgPart(id));
    }

    // Format and match data between SalesISM and SalesRadar
    const formattedData = ismData.map((vessel) => {
      // Find all matching rows in SalesRadar by IMO
      const matchingSalesRadarData = salesRadarData.filter(
        (entry) => entry.IMO === vessel.IMO
      );

      // Get all quotenumber values, joined by a comma if there are multiple matches
      const SalesQuotationNumbers = matchingSalesRadarData.length > 0
        ? matchingSalesRadarData.map(entry => entry.SalesQuotationNumber).join(', ')
        : '-'; // If no quotenumber exists, use '-'

      // Get the region from the VesselISM data (if available)
      const AisPullGfType = imoToRegionMap[vessel.IMO] || '-'; // If region is not found, use '-'

      const AIS = imoToAisMap[vessel.IMO] || '-'; 
      
      // Set pointerColor based on SalesQuotationNumber
      
      const pointerColor = SalesQuotationNumbers !== '-' ? '#80AF81' : '#610C9F'; // green when a SalesQuotationNumber exists, blue otherwise

      return {
        CompanyTitle: vessel.CompanyTitle,
        vesselname: vessel.VesselName, // Updated to match field from SalesISM
        IMO: vessel.IMO,
        AIS: AIS,
        AisPullGfType: AisPullGfType,
        vesseltype: vessel.ShipType, // Updated to match field from SalesISM
        SalesQuotationNumber: SalesQuotationNumbers,
        GrossTonnage: vessel.GrossTonnage,
        CurrentFlag: vessel.CurrentFlag,
        CurrentClass: vessel.CurrentClass,
        ManagementOffice: vessel.ManagementOffice,
        pointerColor: pointerColor 
      };
    });

    // Update vesselData with pointerColor based on whether there is a SalesQuotationNumber
// Update vesselData with pointerColor based on whether there is a SalesQuotationNumber
const updatedVesselData = vesselData.map(vessel => {
    const matchingFormattedData = formattedData.find(v => v.IMO === vessel.IMO);
    const pointerColor = matchingFormattedData && matchingFormattedData.SalesQuotationNumber !== '-'
        ? '#80AF81'  // Blue when a SalesQuotationNumber exists
        : '#610C9F';  // Red when no SalesQuotationNumber

    // Clean the vessel object by converting it to a plain object if it's a Mongoose document
    const cleanVessel = vessel.toObject ? vessel.toObject() : vessel;  // Using .toObject() if it's a Mongoose document

    // Return the vessel object with pointerColor directly inside
    return {
        ...cleanVessel, 
        pointerColor: pointerColor  // Added pointerColor directly
    };
});


    // Return the formatted data and vessel data with pointerColor
    res.json({ formattedData, vesselData: updatedVesselData });


  } catch (error) {
    console.error('Error fetching ISM data:', error);
    res.status(500).json({ error: 'Error fetching ISM data' });
  }
});

    
    router.get('/get-ISM-fleet-all-vessels', async (req, res) => {
    try {
        const vessels = await TrackedVesselISM.find({});

    // Return the formatted data
    res.json( vessels );

  } catch (error) {
    console.error('Error fetching ISM vessels:', error);
    res.status(500).json({ error: 'Error fetching ISM vessels' });
  }
});



// start


router.put(`/api/updateVesselLocation/:IMO`, async (req, res) => {
  const { LATITUDE, LONGITUDE, TIMESTAMP, COURSE, SPEED, HEADING, NAVSTAT, CALLSIGN, TYPE, A, B, C, D, DRAUGHT, DESTINATION, LOCODE, ETA_AIS, ETA, SRC, ZONE, ECA, DISTANCE_REMAINING, ETA_PREDICTED } = req.body;
  const IMO = req.params.IMO;
 
  try {

    console.log('got into api',IMO);

    
    // Update TrackedVessel
    await TrackedVesselISM.findOneAndUpdate({ IMO }, {
      'AIS.LATITUDE': LATITUDE,
      'AIS.LONGITUDE': LONGITUDE,
      'AIS.TIMESTAMP': TIMESTAMP,
      'AIS.COURSE': COURSE,
      'AIS.SPEED': SPEED,
      'AIS.HEADING': HEADING,
      'AIS.NAVSTAT': NAVSTAT,
      'AIS.CALLSIGN': CALLSIGN,
      'AIS.TYPE': TYPE,
      'AIS.A': A,
      'AIS.B': B,
      'AIS.C': C,
      'AIS.D': D,
      'AIS.DRAUGHT': DRAUGHT,
      'AIS.DESTINATION': DESTINATION,
      'AIS.LOCODE': LOCODE,
      'AIS.ETA_AIS': ETA_AIS,
      'AIS.ETA': ETA,
      'AIS.SRC': SRC,
      'AIS.ZONE': ZONE,
      'AIS.ECA': ECA,
      'AIS.DISTANCE_REMAINING': DISTANCE_REMAINING,
      'AIS.ETA_PREDICTED': ETA_PREDICTED,

      'GeofenceStatus': geofenceDetails.geofenceName || null ,
      'geofenceFlag': isInsideAnyGeofence ? geofenceDetails.geofenceFlag : 'Outside',
      // Use geofenceDetails.entryTime (already set correctly) for GeofenceInsideTime
      'GeofenceInsideTime': geofenceDetails.entryTime || null, 
      lastFetchTime: new Date()
    },
    { new: true } // Return the updated document
    );

    res.status(200).json({ message: 'fleet Vessel location and history updated successfully' });
  } catch (error) {
    console.error('Error updating fleet vessel location:', error);
    res.status(500).json({ message: 'Error updating fleet vessel location', error });
  }
});

async function checkAndUpdateVesselData() {
  try {

      // Fetch the smallest sat0 and sat1a values across all documents
    const aisSatPullConfig = await AisSatPullFleet.findOne();
   



      if (!aisSatPullConfig) {
          console.error('fleet Sat pull intervals not found.');
          return;
      }

     // Extract values from the found document
     const { aisuserkey, sat0, sat1a, sat1b, trackVessels } = aisSatPullConfig;

     if(trackVessels){
      console.log('yess')
      const vessels = await TrackedVesselISM.find();
      const TerrestrialGeofences = await TerrestrialGeofence.find();

      if (!TerrestrialGeofences || TerrestrialGeofences.length === 0) {
          console.error('No geofences found.');
          return;
      }

      let vesselsInGeofence = [];

      for (const vessel of vessels) {
          const { LATITUDE: vesselLat, LONGITUDE: vesselLng, NAME, IMO } = vessel.AIS;
          const currentTime = new Date();
          const vesselPoint = turf.point([vesselLng, vesselLat]);

          let isInsideAnyGeofence = false;
          let geofenceDetails = {};
          let interval, sat;

          for (const geofence of TerrestrialGeofences) {
              const geofenceCoordinates = geofence.coordinates.map(coord => [coord.lat, coord.lng]);
              if (geofenceCoordinates[0][0] !== geofenceCoordinates[geofenceCoordinates.length - 1][0] ||
                  geofenceCoordinates[0][1] !== geofenceCoordinates[geofenceCoordinates.length - 1][1]) {
                  geofenceCoordinates.push(geofenceCoordinates[0]);
              }

              const geofencePolygonTr = turf.polygon([geofenceCoordinates]);
              const isInside = turf.booleanPointInPolygon(vesselPoint, geofencePolygonTr);

              if (isInside) {
                  isInsideAnyGeofence = true;
                  geofenceDetails = {
                      geofenceName: geofence.geofenceName,
                      geofenceFlag: 'Inside',
                      entryTime: new Date().toISOString(),
                      exitTime: null,
                  };

                  vesselsInGeofence.push({ NAME, IMO, geofence: geofence.geofenceName });
                  

                   // Use the smallest sat0 and sat1a values based on geofence type
                if (geofence.geofenceType === 'terrestrial' || geofence.geofenceType === 'inport') {
                  interval = sat0;  // Use smallest sat0
                  sat = 0;
              } else if (geofence.geofenceType === 'boundary') {
                  interval = sat1a;  // Use smallest sat1a
                  sat = 1;
              }

                  if(geofence.geofenceType === 'terrestrial'){
                    await TrackedVesselISM.findOneAndUpdate({IMO:IMO},{AisPullGfType:"terrestrial"});
                  }
                  if(geofence.geofenceType === 'inport'){
                    await TrackedVesselISM.findOneAndUpdate({IMO:IMO},{AisPullGfType:"inport"});
                  }
                  if(geofence.geofenceType === 'boundary'){
                    await TrackedVesselISM.findOneAndUpdate({IMO:IMO},{AisPullGfType:"boundary"});
                  }
                     
                  // console.log(`"${geofence.geofenceName}" : inside, geofenceType: ${geofence.geofenceType}`);
                  break;
              }
          }
          if (!isInsideAnyGeofence) {
              interval = sat1b;
              sat = 1;
              // console.log("No vessels inside any geofence");
          }
          const lastFetchTime = vessel.lastFetchTime ? new Date(vessel.lastFetchTime) : null;
          const timeElapsed = lastFetchTime ? currentTime - lastFetchTime : interval;

          if (!lastFetchTime || timeElapsed >= interval) {
              console.log(`fleet Fetching VTExplorer data for ${NAME} with interval ${interval}...`);

              const response = await axios.get('https://api.vtexplorer.com/vessels', {
                params: {
                    userkey:aisuserkey,
                    imo: vessel.AIS.IMO,
                    format: 'json',
                    sat,
                },
            });

            console.log("got ais data");

            const apiData = response.data[0]?.AIS;

            if (apiData && apiData.LATITUDE && apiData.LONGITUDE) {
                if (apiData.LATITUDE !== vesselLat || apiData.LONGITUDE !== vesselLng) {
                 

                    await axios.put(`${reactAPI}/api/updateVesselLocation/${apiData.IMO}`, {
                        LATITUDE: apiData.LATITUDE,
                        LONGITUDE: apiData.LONGITUDE,
                        TIMESTAMP: apiData.TIMESTAMP,
                        COURSE: apiData.COURSE,
                        SPEED: apiData.SPEED,
                        HEADING: apiData.HEADING,
                        NAVSTAT: apiData.NAVSTAT,
                        CALLSIGN: apiData.CALLSIGN,
                        TYPE: apiData.TYPE,
                        A: apiData.A,
                        B: apiData.B,
                        C: apiData.C,
                        D: apiData.D,
                        DRAUGHT: apiData.DRAUGHT,
                        DESTINATION: apiData.DESTINATION,
                        LOCODE: apiData.LOCODE,
                        ETA_AIS: apiData.ETA_AIS,
                        ETA: apiData.ETA,
                        SRC: apiData.SRC,
                        ZONE: apiData.ZONE,
                        ECA: apiData.ECA,
                        DISTANCE_REMAINING: apiData.DISTANCE_REMAINING,
                        ETA_PREDICTED: apiData.ETA_PREDICTED,
                        lastFetchTime: currentTime,
                        geofenceDetails: isInsideAnyGeofence ? geofenceDetails : null,
                    });
                    console.log(`Vessel ${NAME} (IMO: ${IMO}) location updated.`);
                } else {
                    await TrackedVesselISM.updateOne({ _id: vessel._id }, { lastFetchTime: currentTime });
                }
              } else {
                  console.error(`Invalid data for vessel ${NAME}`);
              }
          } else {
              // console.log(`Skipping vessel ${NAME} (IMO: ${IMO}) - waiting for next interval...`);
          }
      }


    }
    else{
      console.log('skip');
    }
     
  } catch (error) {
      console.error('Error checking and updating fleet vessel data:', error);
  } finally {
      setTimeout(checkAndUpdateVesselData, 1000 * 60 ); // Runs the function 
  }
}

checkAndUpdateVesselData();


// end
    

  export default router; 
