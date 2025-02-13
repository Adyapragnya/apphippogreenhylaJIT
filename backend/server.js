import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import axios from 'axios';
import cron from 'node-cron';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcrypt';
import * as turf from '@turf/turf'; // Importing all turf functions as a namespace
const port = 5000;
import CryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';
const router = express.Router();
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import fetch from 'node-fetch' ; 
// For other imports, keep them as is
import alertRoutes from './routes/alertRoutes.js';
import organizationRoutes from './routes/organizationRoutes.js';
import organizationISMRoutes from './routes/organizationISMRoutes.js';
import userRoutes from './routes/userRoutes.js';
import loginRoutes from './routes/loginRoutes.js';
import verifyToken from './middleware/verifyToken.js'; // Make sure to add `.js` extension
import LoginUsers from './models/LoginUsers.js';
import TrackedVessel from './models/TrackedVessel.js';
import TrackedVesselByUser from './models/TrackedVesselByUser.js';
import PolygonGeofence from './models/PolygonGeofence.js';
import Geofence from './models/Geofence.js';
import AisSatPull from './models/AisSatPull.js';
import TerrestrialGeofence from './models/TerrestrialGeofence.js';
import customFieldsRoutes from './routes/customFields.js';
import geolib from 'geolib';
import EmailForAlerts from './models/EmailForAlerts.js';
import EmailOptionsTosend from './models/EmailOptionsTosend.js';
import HylaGeofenceTypes from './models/HylaGeofenceTypes.js';
import SalesRadar from './models/SalesRadar.js';
import OpsRadar from './models/OpsRadar.js';
import SalesRadarHistory from './models/SalesRadarHistory.js';
import OpsRadarHistory from './models/OpsRadarHistory.js';
import EnableRoutesMenu from './models/EnableRoutesMenu.js';
import TableOrderFav from './models/TableOrderFav.js';

import OrganizationISM from './models/OrganizationISM.js';
import SalesISM from './models/SalesISM.js';
import TrackedVesselISM from './models/TrackedVesselISM.js';

import Port from './models/Port.js';
import Voyages from './models/Voyages.js';
import JitReport from './models/JitReport.js';




const app = express();
// Middleware to handle JSON requests
app.use(express.json());

app.use(cors()); 


dotenv.config();  // Load environment variables


const mongoURI = process.env.MONGO_URI;
const reactAPI = process.env.REACT_APP_API_BASE_URL;

// Connect to MongoDB using Mongoose
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully') )
.catch(err => console.error('MongoDB connection error:', err));


import nodemailer from 'nodemailer';


let emailUser = '';
let emailPass = '';
let userkey = '';
let openaiAPI = '';


// Function to load email credentials from the database
async function loadEmailCredentials() {
  try {
      const emailOption = await EmailOptionsTosend.findOne({});
      if (emailOption) {
          emailUser = emailOption.user;
          emailPass = emailOption.pass;
          userkey=emailOption.aisuserkey;
          openaiAPI= emailOption.openaiApiKey;

          console.log('Email credentials loaded successfully.');
         
      } else {
          console.error('No email credentials found in the database.');
      }
  } catch (error) {
      console.error('Error loading email credentials:', error);
  }
}

// Load credentials when the server starts
loadEmailCredentials();

// Create a transporter object with SMTP transport
const transporter = nodemailer.createTransport({
  
    service: 'gmail', // or another email service provider
    auth: {
        user: emailUser,
        pass: emailPass,
    }
});


// Define Mongoose schema and model for vessel_master collection
const vesselSchema = new mongoose.Schema({
    imoNumber: Number,
    transportName: String,
    FLAG: String,
    StatCode5: String,
    transportCategory: String,
    transportSubCategory: String,
    SpireTransportType: String,
    buildYear: Number,
    GrossTonnage: Number,
    deadWeight: Number,
    LOA: Number,
    Beam: Number,
    MaxDraft: Number,
    ME_kW_used: Number,
    AE_kW_used: Number,
    RPM_ME_used: Number,
    Enginetype_code: String,
    subst_nr_ME: Number,
    Stofnaam_ME: String,
    Fuel_ME_code_sec: String,
    EF_ME: Number,
    Fuel_code_aux: String,
    EF_AE: Number,
    EF_gr_prs_ME: Number,
    EF_gr_prs_AE_SEA: Number,
    EF_gr_prs_AE_BERTH: Number,
    EF_gr_prs_BOILER_BERTH: Number,
    EF_gr_prs_AE_MAN: Number,
    EF_gr_prs_AE_ANCHOR: Number,
    NO_OF_ENGINE_active: Number,
    CEF_type: Number,
    Loadfactor_ds: Number,
    Speed_used_: Number,
    CRS_max: Number,
    Funnel_heigth: Number,
    MMSI: Number,
    updatedAt: Date,
    Engine_tier: Number,
    NOx_g_kwh: Number,
    summer_dwt: Number,
    transportNo: Number,
    transportType: String
});

// Index for search optimization
vesselSchema.index({ transportName: 'text' });

const Vessel = mongoose.model('vessel_master', vesselSchema, 'vessel_master');

export default Vessel;

const voyageSchema = new mongoose.Schema({
    VoyageId : String,
    IMO: Number,
    NAME: String,
    voyageDetails: {
    departurePort: String,     // Port of departure
    arrivalPort: String,       // Port of arrival
    departureDate:String,     // Departure date in ISO 8601 format
    arrivalDate: String,       // Estimated arrival date in ISO 8601 format
    actualArrivalDate: String, // Actual arrival date in ISO 8601 format
    voyageDuration: String,    // Duration of the voyage in hours
    status: String             // Status of the voyage (e.g., underway, completed, delayed)
  },
  cargo : 
    {
      cargoType: String,        // Type of cargo being transported
      quantity: Number,         // Quantity of cargo in tons
      unit: String             // Unit of measurement (e.g., tons, cubic meters)
    },

  crew: 
    {
      name: String,             // Name of the crew member
      position: String,         // Position on the vessel (e.g., captain, engineer)
      nationality: String       // Nationality of the crew member
    },
  logs: 
    {
      timestamp: String,        // Timestamp of the log entry in ISO 8601 format
      event: String             // Description of the event (e.g., departure, arrival, incident)
    }
  
}, { timestamps: true });

const voyageDetail = mongoose.model('voyageDetails', voyageSchema, 'voyageDetails');



// app.post('/api/updateGeofence', async (req, res) => {
//     const { name, geofenceStatus, geofenceInsideTime } = req.body;

//     try {
//         // Find the vessel by name in the AIS data
//         const vessel = await TrackedVessel.findOne({ 'AIS.NAME': name });

//         // Check if the vessel exists
//         if (!vessel) {
//             return res.status(404).send({ message: 'Vessel not found' });
//         }

//         // If vessel is already inside the geofence, return without updating
//         if (vessel.GeofenceStatus === 'Inside') {
//             return res.status(200).send({ message: 'Vessel is already inside the geofence' });
//         }

//         // Update geofence status and inside time for the vessel
//         vessel.GeofenceStatus = geofenceStatus;
//         vessel.GeofenceInsideTime = geofenceInsideTime;
//         vessel.geofenceFlag = 'Entered'; // Update geofence flag

//         // Save the updated vessel information
//         await vessel.save();

//         res.status(200).send({ message: 'Geofence status updated successfully' });
//     } catch (error) {
//         console.error('Error updating geofence status:', error);
//         res.status(500).send({ message: 'Server error' });
//     }
// });


// const vesselGeofenceHistorySchema = new mongoose.Schema({
//     vesselId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrackedVessel', required: true },
//     vesselName: String,
//     entries: [{
//         geofenceName: String,
//         entryTime: Date,
//         exitTime: Date,
//         currentStatus: { type: String, enum: ['Inside', 'Outside'], default: 'Outside' }, // status for each entry
//     }],
//     updatedAt: { type: Date, default: Date.now }
// });

// const VesselGeofenceHistory = mongoose.model('VesselGeofenceHistory', vesselGeofenceHistorySchema, 'vesselGeofenceHistories');

// app.get('/api/vesselGeofenceHistory/:id', async (req, res) => {
//     const vesselId = req.params.id;

//     try {
//         const history = await VesselGeofenceHistory.findOne({ vesselId });
//         if (!history) {
//             return res.status(404).send({ message: 'Vessel history not found' });
//         }

//         res.status(200).send(history);
//     } catch (error) {
//         console.error('Error fetching vessel history:', error);
//         res.status(500).send({ message: 'Server error' });
//     }
// });

// app.post('/api/updateGeofenceHistory', async (req, res) => {
//     const { vesselId, entries } = req.body;
//     try {
//         await VesselGeofenceHistory.findOneAndUpdate(
//             { vesselId },
//             { entries },
//             { upsert: true, new: true }
//         );
//         res.status(200).send({ message: 'Vessel geofence history updated successfully' });
//     } catch (error) {
//         console.error('Error updating vessel history:', error);
//         res.status(500).send({ message: 'Server error' });
//     }
// });






app.post('/api/addcirclegeofences', async (req, res) => {
    console.log('Received Circle Geofence:', req.body); // Add logging
    const { geofenceId, geofenceName, geofenceType, date, remarks, coordinates } = req.body;

    // Perform additional checks if needed
    if (!coordinates || coordinates.length === 0 || coordinates[0].radius <= 0) {
        return res.status(400).json({ error: 'Invalid coordinates or radius.' });
    }

    const geofence = new Geofence({
        geofenceId,
        geofenceName,
        geofenceType,
        date,
        remarks,
        coordinates: coordinates.map(coord => ({ lat: coord.lat, lng: coord.lng, radius: coord.radius })),
    });

    try {
        await geofence.save();
        res.status(201).json({ message: 'Circle geofence saved successfully!' });
    } catch (error) {
        console.error('Error saving geofence:', error); // Log the error
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to retrieve all circle geofences
app.get('/api/circlegeofences', async (req, res) => {
    try {
        const geofences = await Geofence.find(); // Adjust if necessary
        res.status(200).json(geofences);
    } catch (error) {
        console.error('Error fetching circle geofences:', error);
        res.status(500).json({ error: error.message });
    }
});


  
// Example POST endpoint for saving polygon geofences
app.post('/api/addpolygongeofences', async (req, res) => {
    const { geofenceId, geofenceName, geofenceType, date, remarks, coordinates } = req.body;
  
    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      return res.status(400).json({ error: 'Coordinates are required and should be an array.' });
    }
  
    const newGeofence = new PolygonGeofence({
      geofenceId,
      geofenceName,
      geofenceType,
      date,
      remarks,
      coordinates,
    });
  
    try {
      const savedGeofence = await newGeofence.save();
      res.status(201).json(savedGeofence);
    } catch (error) {
      console.error('Error saving geofence:', error);
      res.status(500).json({ error: 'Failed to save geofence data.' });
    }
  });
  
  // API to fetch polygon geofences
  app.get('/api/polygongeofences', async (req, res) => {
    try {
      const polygonGeofences = await PolygonGeofence.find();
      res.json(polygonGeofences);
    } catch (error) {
      console.error('Error fetching polygon geofences:', error);
      res.status(500).json({ error: 'Failed to fetch polygon geofences' });
    }
  });

   // API to fetch polygon geofences
   app.get('/api/polygonTerrestrialGeofences-2', async (req, res) => {
    try {
      const TerrestrialGeofences = await TerrestrialGeofence.find({geofenceType: "inport"});

    
      res.json(TerrestrialGeofences);
    } catch (error) {
      console.error('Error fetching polygon terrestrial geofences:', error);
      res.status(500).json({ error: 'Failed to fetch polygon terrestrial geofences' });
    }
  });






  // start

  // app.post('/api/geofences', async (req, res) => {
  //   try {
  //     const { geofenceId, geofenceName, geofenceType, coordinates } = req.body;
  //     const newGeofence = new Geofence({
  //       geofenceId,
  //       geofenceName,
  //       geofenceType,
  //       coordinates
  //     });
  
  //     await newGeofence.save();
  //     res.status(201).json({ message: 'Geofence created', geofence: newGeofence });
  //   } catch (error) {
  //     console.error('Error saving geofence:', error);
  //     res.status(500).json({ message: 'Error saving geofence' });
  //   }
  // });
  
  // Get all Geofences
  app.get('/api/geofences', async (req, res) => {
    try {
      const geofences = await PolygonGeofence.find();
      res.status(200).json(geofences);
    } catch (error) {
      console.error('Error fetching geofences:', error);
      res.status(500).json({ message: 'Error fetching geofences' });
    }
  });

  
  app.delete('/api/geofences/:geofenceId', async (req, res) => {
    try {
     
      await PolygonGeofence.findOneAndDelete({geofenceId : req.params.geofenceId});
      res.status(200).send('Geofence deleted successfully');
    } catch (error) {
      res.status(500).json({ message: 'Error deleting geofence', error });
    }
  });
  
  
  // Update Geofence
  app.put('/api/geofences/:id', async (req, res) => {
    try {
      const { geofenceId, geofenceName, geofenceType, coordinates } = req.body;
      const updatedGeofence = await PolygonGeofence.findOneAndUpdate(
        { geofenceId: req.params.id },
        { geofenceName, geofenceType, coordinates },
        { new: true }
      );
      if (!updatedGeofence) {
        return res.status(404).json({ message: 'Geofence not found' });
      }
      res.status(200).json({ message: 'Geofence updated', geofence: updatedGeofence });
    } catch (error) {
      console.error('Error updating geofence:', error);
      res.status(500).json({ message: 'Error updating geofence' });
    }
  });
  
 

  // end

  const PolylineGeofenceSchema = new mongoose.Schema({
    geofenceId: String,
    geofenceName: String,
    geofenceType: String,
    date: String,
    remarks: String,
    coordinates: Array,
});

const PolylineGeofence = mongoose.model('PolylineGeofence', PolylineGeofenceSchema);



// Example POST endpoint for saving polyline geofences
app.post('/api/addpolylinegeofences', async (req, res) => {
    const { geofenceId, geofenceName, geofenceType, date, remarks, coordinates } = req.body;
    console.log('Received polyline geofence data:', req.body);
    try {
        const newPolylineGeofence = new PolylineGeofence({
            geofenceId,
            geofenceName,
            geofenceType,
            date,
            remarks,
            coordinates,
        });

        await newPolylineGeofence.save();
        res.status(201).json(newPolylineGeofence);
    } catch (error) {
        console.error('Error saving polyline geofence:', error);
        res.status(500).json({ error: 'Failed to save polyline geofence data.' });
    }
});

// Route to get all polyline geofences
app.get('/api/polylinegeofences', async (req, res) => {
    try {
        const polylineGeofences = await PolylineGeofence.find();
        res.status(200).json(polylineGeofences);
        // console.log(PolylineGeofence);
    } catch (error) {
        console.error('Error fetching polyline geofences:', error);
        res.status(500).json({ error: 'Error fetching polyline geofences' });
    }
});

// Example DELETE endpoint for removing a polyline geofence by ID
app.delete('/api/polylinegeofences/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedGeofence = await PolylineGeofence.findByIdAndDelete(id);
        if (!deletedGeofence) {
            return res.status(404).json({ error: 'Geofence not found' });
        }
        res.status(200).json({ message: 'Geofence deleted successfully' });
    } catch (error) {
        console.error('Error deleting polyline geofence:', error);
        res.status(500).json({ error: 'Error deleting polyline geofence' });
    }
});

app.post('/api/add-combined-data', async (req, res) => {
    try {

   
        // console.log('Combined Data Request Body:', req.body); // Log the request body
        

        // Extract AIS data and other details from the request body
        const { IMO,'0': { AIS } = {}, SpireTransportType, FLAG, GrossTonnage, deadWeight,email } = req.body;
       console.log(req.body);

        if (!AIS ) {
            return res.status(400).json({ error: 'AIS data is missing' });
        }

        if (!SpireTransportType ) {
          return res.status(400).json({ error: 'SpireTransportType is missing' });
      } 
        // console.log('Email from body:', email);

        const currentTime = new Date(); 
        // Create a new CombinedData document
        const newCombinedData = new TrackedVessel({ IMO,AIS, SpireTransportType, FLAG, GrossTonnage, deadWeight,trackingFlag: true,lastFetchTime: currentTime,GeofenceStatus: null, geofenceFlag: null,GeofenceInsideTime: null, AisPullGfType: null });
      
        // Save the document to the database
        await newCombinedData.save();
        console.log('Combined data saved successfully');
        res.status(201).json({ message: 'Combined data saved successfully' });

        // Extract vessel details
        const vesselName = AIS.NAME;
        const imo = AIS.IMO;
        const zone = AIS.ZONE || 'N/A'; // Use 'N/A' if ZONE is not provided
        const flag = FLAG || 'N/A'; // Use 'N/A' if FLAG is not provided

        // List of email addresses
        const emailAddresses = ['tech.adyapragnya@gmail.com, sales@adyapragnya.com'];
        // const emailAddresses = ['tech.adyapragnya@gmail.com'];

        // to: 'hemanthsrinivas707@gmail.com, sales@adyapragnya.com,kdalvi@hylapps.com, abhishek.nair@hylapps.com',
        // Send an email notification to each recipient individually
      
        
        const transporter = nodemailer.createTransport({
          service: 'gmail', // or another email service provider
          auth: {
              user: emailUser,
              pass: emailPass,
          },
      });
       
        
            const date = new Date();
            const options = { day: '2-digit', month: 'short', year: '2-digit' };
            const formattedDate = date.toLocaleDateString('en-GB', options).replace(',', '');
            const document = await EmailForAlerts.findOne();
            // const emailvs =document.vesseladdemail;
          
            await transporter.sendMail({

                from: emailUser, // sender address
                bcc: email, // individual receiver address
                subject: `HYLA Alert:${vesselName} added to tracking`, // Subject line
                text: `${vesselName} has been added to your tracking system as of today ${formattedDate}. You will receive real-time updates on its location and movements.

Details of the ship:
Name: ${vesselName}
IMO: ${imo}

${vesselName} will be tracked for the next 30 days. Should you require any further assistance, contact admin@hylapps.com.

Thank You,
HYLA Admin
www.greenhyla.com
`,
            });
        

          // Send WhatsApp message
  //         const accessToken = 'EAAPFZBVZCcJpkBO1icFVEUAqZBZA6SOw614hQaLmsooJTLIdR2njKZCL9G7z9O2NSLZAZAHTAMGqhaFSlV0DdMyqZBhy13zkZCZBI6OO8hUp28c6sFmpNPAjv1V8bVOVisfGZCOXyJHrnZBxZBQAG9gGI7Wt6gUqI9Qs1pYwl2RmdZAWPwKNJ0i0NAg1nL8MtPZCfLDzLMW9mWaNjzLsZAsc7qUnLOZBWR0bZCYQkDBqegmngZD';
  //         const phoneNumberId = '481471688383235';

  //         const date = new Date();
  //         const options = { day: '2-digit', month: 'short', year: '2-digit' };
  //         const formattedDate = date.toLocaleDateString('en-GB', options).replace(',', '');
  
  //         const whatsappMessage = {
  //             messaging_product: 'whatsapp',
  //             to: '+916382125732', // Receiver's WhatsApp number in international format
  //             type: 'text',
  //             text: {
  //                 body: `${vesselName} has been added to your tracking system as of today ${formattedDate}. You will receive real-time updates on its location and movements.
  
  // Details of the ship:
  // Name: ${vesselName}
  // IMO: ${imo}
  
  // This vessel will be tracked for the next 30 days. Contact admin@hylapps.com for further assistance.`
  //             }
  //         };
  
  //         await axios.post(`https://graph.facebook.com/v15.0/${phoneNumberId}/messages`, whatsappMessage, {
  //             headers: {
  //                 Authorization: `Bearer ${accessToken}`,
  //                 'Content-Type': 'application/json'
  //             }
  //         });

        // res.status(201).json({ message: 'Combined data saved successfully and emails sent' });
    } catch (error) {
        console.error('Error adding combined data:', error);
        res.status(500).json({ error: 'Error adding combined data' });
    }
  });



  app.post('/api/add-vessel-tracked-by-user', async (req, res) => {
    try {
        // Destructure the required fields from req.body
        const { loginUserId, email, IMO, AdminId, OrgId, AddedDate, vesselName } = req.body;
       console.log(req.body);
        // Check if all required fields are provided
        if (!loginUserId || !email || !IMO || !vesselName || AddedDate === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create a new document using the provided data
        const newData = new TrackedVesselByUser({
            loginUserId,
            email,
            IMO,
            AdminId,
            OrgId,
            AddedDate,
            
        });

        // Save the document to the database
        await newData.save();



        res.status(201).json({ message: 'Vessel tracked by user added successfully' });

           
        const transporter = nodemailer.createTransport({
          service: 'gmail', // or another email service provider
          auth: {
              user: emailUser,
              pass: emailPass,
          },
      });
       
        
            const date = new Date();
            const options = { day: '2-digit', month: 'short', year: '2-digit' };
            const formattedDate = date.toLocaleDateString('en-GB', options).replace(',', '');
         
            const imo = IMO;
            
          
            await transporter.sendMail({

                from: emailUser, // sender address
                bcc: email, // individual receiver address
                subject: `HYLA Alert:${vesselName} added to tracking`, // Subject line
                text: `${vesselName} has been added to your tracking system as of today ${formattedDate}. You will receive real-time updates on its location and movements.

Details of the ship:
Name: ${vesselName}
IMO: ${imo}

${vesselName} will be tracked for the next 30 days. Should you require any further assistance, contact admin@hylapps.com.

Thank You,
HYLA Admin
www.greenhyla.com
`,
            });
        
    } catch (error) {
        console.error('Error adding data:', error);
        res.status(500).json({ error: 'Error adding data' });
    }
});



app.post('/api/add-Ops-data-for-adding-vessel', async (req, res) => {
  try {
      // Destructure the required fields from req.body
      const { loginUserId, email, IMO, AdminId, OrgId, AddedDate, vesselName } = req.body;

     console.log(req.body);
      // Check if all required fields are provided
      if (!loginUserId || !email || !IMO || !vesselName || AddedDate === undefined) {
          return res.status(400).json({ error: 'Missing required fields' });
      }

     


      const newOps = new OpsRadar({

        loginUserId,
        AdminId,
        OrgId,
        IMO,
        CaseId: 0,
        Agent: "-",
        AgentName: "-",
        Info1: "-",
        ETA : "-"

      })

      await newOps.save();


      res.status(201).json({ message: 'ops added successfully' });

         
     
        
          
        
         
      
  } catch (error) {
      console.error('Error adding ops data:', error);
      res.status(500).json({ error: 'Error adding ops data' });
  }
});


app.get('/api/get-vessel-tracked-by-user', async (req, res) => {
  try {
      
      const vessels = await TrackedVesselByUser.find();
     

      res.json(vessels);
  } catch (error) {
      console.error('Error fetching vessel tracked by users:', error);
      res.status(500).json({ error: 'Error fetching vessel tracked by users' });
  }
});




app.get('/api/get-ops-table-order', async (req, res) => {
  try {
      
      const orders = await TableOrderFav.find();
     

      res.json(orders);
  } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Error fetching orders' });
  }
});




app.get('/api/get-vessel-tracked-by-user-based-on-OrgId', async (req, res) => {
  try {
    const { OrgId } = req.query;
 
   

      // Filter vessels based on orgId (this can be done in the database query itself)
     const filteredVessels = await TrackedVesselByUser.find({OrgId : OrgId});
     
     
   
      // Return only the IMO values (or full vessel data as needed)
     const imoValues = filteredVessels.map(vessel => vessel.IMO);
   
        // Filter vessels in the TrackedVessel collection where IMO is in imoValues array
    const vesselFilter = await TrackedVessel.find({ IMO: { $in: imoValues } });


      res.json(vesselFilter);
      // console.log(vesselFilter);
  } catch (error) {
      console.error('Error fetching vessel tracked by users:', error);
      res.status(500).json({ error: 'Error fetching vessel tracked by users' });
  }
});


// sales vessels
app.get('/api/get-salesvessels-based-on-OrgId', async (req, res) => {
  try {
    const { OrgId } = req.query;
 
   
      



      // Filter vessels based on orgId (this can be done in the database query itself)
     const filteredVessels = await TrackedVesselByUser.find({OrgId : OrgId});
     
     
   
      // Return only the IMO values (or full vessel data as needed)
     const imoValues = filteredVessels.map(vessel => vessel.IMO);
   
        // Filter vessels in the TrackedVessel collection where IMO is in imoValues array
    const vesselFilter = await TrackedVessel.find({ IMO: { $in: imoValues } });

    const filteredSalesData = await SalesRadar.find({OrgId : OrgId});

    // Extract the list of IMO values from filteredSalesData
    const salesImos = new Set(filteredSalesData.map(sale => sale.IMO));

    // Filter vesselFilter to only include vessels with IMOs present in salesImos
    const finalVessels = vesselFilter.filter(vessel => salesImos.has(vessel.IMO));


      res.json(finalVessels);


      // console.log(vesselFilter);
  } catch (error) {
      console.error('Error fetching vessel tracked by users:', error);
      res.status(500).json({ error: 'Error fetching vessel tracked by users' });
  }
});



app.get('/api/get-vessel-tracked-by-user-based-on-loginUserId', async (req, res) => {
  try {
    const { loginUserId } = req.query;
 
   

      // Filter vessels based on loginUserId (this can be done in the database query itself)
     const filteredVessels = await TrackedVesselByUser.find({loginUserId : loginUserId});
     
     
   
      // Return only the IMO values (or full vessel data as needed)
     const imoValues = filteredVessels.map(vessel => vessel.IMO);
   
        // Filter vessels in the TrackedVessel collection where IMO is in imoValues array
    const vesselFilter = await TrackedVessel.find({ IMO: { $in: imoValues } });


      res.json(vesselFilter);
      // console.log(vesselFilter);
  } catch (error) {
      console.error('Error fetching vessel tracked by users:', error);
      res.status(500).json({ error: 'Error fetching vessel tracked by users' });
  }
});


app.get('/api/get-routes-menu-enabling-ids', async (req, res) => {
  try {
      
      const OrgIds = await EnableRoutesMenu.findOne();
     

      res.json(OrgIds);
  } catch (error) {
      console.error('Error fetching orgIds:', error);
      res.status(500).json({ error: 'Error fetching orgIds' });
  }
});


  // app.post("/api/upload-ops-data-bulk", async (req, res) => {

  //   try {
  //     console.log(req.body);
  //     const data = req.body; // Get the sales data from the request
  //     const imoNumbers = data.map(row => row.IMO); // Extract IMO numbers from the data
  //     const foundImos = [];
  //     let notFoundImos = [];
  //     const errorMessages = [];
  //     const successCount = [];
  //     const failureCount = [];
  //     const userTrackedData = []; // Array to store user-tracked vessel data
      
  //     // Extract user details from the first row (assuming all rows have the same user context)
  //     const { loginUserId, email, AdminId, OrgId } = data[0]; 
     
  
  //     // Check which IMOs exist in the TrackedVessel collection
  //     const trackedVessels = await TrackedVessel.find({ IMO: { $in: imoNumbers } }).select('IMO');
  //     const trackedImos = trackedVessels.map(vessel => vessel.IMO);
      
  //     // Separate found and not found IMOs
  //     for (const imo of imoNumbers) {
  //       if (trackedImos.includes(imo)) {
  //         foundImos.push(imo);
  //       } else {
  //         notFoundImos.push(imo);
  //       }
  //     }
  
  //     // Remove duplicates from notFoundImos
  //     notFoundImos = [...new Set(notFoundImos)];
  
  //     // Process not found IMOs and add them as new tracked vessels
  //     for (const imo of notFoundImos) {
  //       try {
  //         // Fetch vessel details from Vessel collection
  //         const vesselData = await Vessel.findOne({ imoNumber: imo }).select(
  //           "SpireTransportType FLAG GrossTonnage deadWeight"
  //         );
  //         if (!vesselData) {
  //           const errorMessage = `Vessel with IMO ${imo} not found in vessel_master`;
  //           console.error(errorMessage);
  //           errorMessages.push(errorMessage);
  //           failureCount.push(imo);
  //           continue;
  //         }
          
  //         // Fetch AIS data
  //         const aisResponse = await axios.get("https://api.vtexplorer.com/vessels", {
  //           params: { userkey, imo, format: "json", sat: "1" },
  //         });
  //         const aisDataArray = aisResponse.data;
  //         if (!aisDataArray || aisDataArray.length === 0) {
  //           const errorMessage = `AIS data not found for IMO ${imo}`;
  //           console.error(errorMessage);
  //           errorMessages.push(errorMessage);
  //           failureCount.push(imo);
  //           continue;
  //         }
          
  //         // Add new TrackedVessel
  //         const currentTime = new Date();
  //         const aisData = aisDataArray[0].AIS;
  //         const newTrackedVessel = new TrackedVessel({
  //           IMO: imo,
  //           AIS: { ...aisData },
  //           SpireTransportType: vesselData.SpireTransportType,
  //           FLAG: vesselData.FLAG,
  //           GrossTonnage: vesselData.GrossTonnage,
  //           deadWeight: vesselData.deadWeight,
  //           trackingFlag: true,
  //           lastFetchTime: currentTime,
  //           GeofenceStatus: null,
  //           geofenceFlag: null,
  //           GeofenceInsideTime: null,
  //           AisPullGfType: null,
  //         });
  //         await newTrackedVessel.save();
  //         successCount.push(imo);
  //       } catch (error) {
  //         console.error(`Error processing IMO ${imo}:`, error.message);
  //         errorMessages.push(`Error processing IMO ${imo}: ${error.message}`);
  //         failureCount.push(imo);
  //       }
  //     }
  
  //     // Save the ops data
  //     const savedDocuments = [];

  //     for (const row of data) {
  //       // Check for existing CaseId

  //       // use this mandatorily
  //       const existingSale = await OpsRadar.findOne({ CaseId: row.CaseId });
  
  //       if (existingSale) {
         
  //         const oldDocument = new OpsRadarHistory(existingSale.toObject());
  //         await oldDocument.save();
  
  //         // Remove old document from SalesRadar
  //         await OpsRadar.deleteOne({ _id: existingSale._id });
  
          
  //       }
             
  //       // Save the new document to SalesRadar
  //       const newOps = new OpsRadar({
  //         loginUserId: loginUserId,
  //         AdminId: AdminId,
  //         OrgId: OrgId,

  //         IMO: row.IMO,
  //         CaseId: row.CaseId,
  //         Agent: row.Agent,
  //         AgentName: row.AgentName,
  //         Info1: row.Info1,
  //         ETA : row.ETA,


  //       });
  //       const savedOps = await newOps.save();
  //       savedDocuments.push(savedOps);
  
  //       // Add user tracking data
  //       const requestBody3 = { 
  //         loginUserId,
  //         email,
  //         IMO: row.IMO,
  //         AdminId,
  //         OrgId,
  //         AddedDate: new Date().toISOString(),
  //       };
  //       const newUserTrackedVessel = new TrackedVesselByUser(requestBody3);
  //       await newUserTrackedVessel.save();
  //       userTrackedData.push(newUserTrackedVessel);
  //     }
  
  //     // Response with details
  //     res.status(200).json({
  //       message: "Ops Data uploaded successfully",
  //       savedDocuments,
  //       foundImos,
  //       notFoundImos,
  //       successCount,
  //       failureCount,
  //       errorMessages,
  //       userTrackedData, // Include user tracking data in the response
  //     });
  //   } catch (error) {
  //     console.error('Error uploading ops data:', error);
  //     res.status(500).json({ error: 'Failed to upload data' });
  //   }
  
  // });
  

//  API to fetch polygon geofences
 

app.post("/api/upload-ops-data-bulk", async (req, res) => {
  try {
    const data = req.body; // Get the ops data from the request
    const imoNumbers = data.map(row => row.IMO); // Extract IMO numbers from the data
    const foundImos = [];
    let notFoundImos = [];
    const errorMessages = [];
    const successCount = [];
    const failureCount = [];
    const userTrackedData = []; // Array to store user-tracked vessel data
    
    // Extract user details from the first row (assuming all rows have the same user context)
    const { loginUserId, email, AdminId, OrgId } = data[0]; 
    
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

    // Remove duplicates from notFoundImos
    notFoundImos = [...new Set(notFoundImos)];

    // Process not found IMOs and add them as new tracked vessels
    for (const imo of notFoundImos) {
      try {
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
        
        // Add new TrackedVessel
        const currentTime = new Date();
        const aisData = aisDataArray[0].AIS;
        const newTrackedVessel = new TrackedVessel({
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
        await newTrackedVessel.save();
        successCount.push(imo);
      } catch (error) {
        console.error(`Error processing IMO ${imo}:`, error.message);
        errorMessages.push(`Error processing IMO ${imo}: ${error.message}`);
        failureCount.push(imo);
      }
    }

    // Move all old ops data of this loginUserId to OpsRadarHistory before adding new data
    const existingSales = await OpsRadar.find({ loginUserId: data[0].loginUserId });

    if (existingSales.length > 0) {
      // Bulk operation for moving old ops data to OpsRadarHistory and deleting from OpsRadar
      const bulkOpsHistory = [];
      const bulkOpsDelete = [];

      for (const existingSale of existingSales) {
        // Create a new OpsRadarHistory document
        bulkOpsHistory.push({
          insertOne: {
            document: existingSale.toObject(),
          },
        });

        // Prepare the delete operation for OpsRadar
        bulkOpsDelete.push({
          deleteOne: {
            filter: { _id: existingSale._id },
          },
        });
      }

      // Execute bulk operations for saving history and deleting old records
      if (bulkOpsHistory.length > 0) {
        await OpsRadarHistory.bulkWrite(bulkOpsHistory);
      }
      if (bulkOpsDelete.length > 0) {
        await OpsRadar.bulkWrite(bulkOpsDelete);
      }
    }

    // Save the new ops data
    const savedDocuments = [];
    for (const row of data) {
      try {
        // Now, add the new ops data to OpsRadar collection (new data from the request)
        const newOps = new OpsRadar({
          loginUserId: row.loginUserId,
          AdminId: AdminId,
          OrgId: OrgId,
          IMO: row.IMO,
          CaseId: row.CaseId,
          Agent: row.Agent,
          AgentName: row.AgentName,
          Info1: row.Info1,
          ETA: row.ETA,
        });

        const savedOps = await newOps.save();
        savedDocuments.push(savedOps);

        if (!row.IMO) {
          console.log('Invalid IMO value. The document will not be added.');
        } else {
          // Add user tracking data
          const requestBody3 = { 
            loginUserId,
            email,
            IMO: row.IMO,
            AdminId,
            OrgId,
            AddedDate: new Date().toISOString(),
          };

          // Check if a document with the same loginUserId and IMO already exists
          const existingDocument = await TrackedVesselByUser.findOne({
            loginUserId: requestBody3.loginUserId,
            IMO: requestBody3.IMO
          });

          if (!existingDocument) {
            // If no document exists, create and save the new user tracked vessel data
            const newUserTrackedVessel = new TrackedVesselByUser(requestBody3);
            await newUserTrackedVessel.save();
            userTrackedData.push(newUserTrackedVessel);
          } 
        }

      } catch (error) {
        console.error('Error saving Ops data:', error);
        res.status(500).json({ error: 'Failed to upload data' });
        return;
      }
    }

    // Response with details
    res.status(200).json({
      message: "Ops Data uploaded successfully",
      savedDocuments,
      foundImos,
      notFoundImos,
      successCount,
      failureCount,
      errorMessages,
      userTrackedData, // Include user tracking data in the response
    });
  } catch (error) {
    console.error('Error uploading ops data:', error);
    res.status(500).json({ error: 'Failed to upload data' });
  }
});

 
 
 app.get('/api/get-uploaded-ops-data', async (req, res) => {
  try {
    const OpsRadars = await OpsRadar.find();
    res.json(OpsRadars);
  } catch (error) {
    console.error('Error fetching ops data:', error);
    res.status(500).json({ error: 'Failed to fetch ops data' });
  }
});
 
 
 
 
app.post('/api/upload-sales-data', async (req, res) => {
  try {
    const data = req.body; // Get the sales data from the request
    const imoNumbers = data.map(row => row.IMO); // Extract IMO numbers from the data
    const foundImos = [];
    let notFoundImos = [];
    const errorMessages = [];
    const successCount = [];
    const failureCount = [];
    const userTrackedData = []; // Array to store user-tracked vessel data
    
    // Extract user details from the first row (assuming all rows have the same user context)
    const { loginUserId, email, AdminId, OrgId } = data[0]; 
   

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

    // Remove duplicates from notFoundImos
    notFoundImos = [...new Set(notFoundImos)];

    // Process not found IMOs and add them as new tracked vessels
    for (const imo of notFoundImos) {
      try {
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
        
        // Add new TrackedVessel
        const currentTime = new Date();
        const aisData = aisDataArray[0].AIS;
        const newTrackedVessel = new TrackedVessel({
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
        await newTrackedVessel.save();
        successCount.push(imo);
      } catch (error) {
        console.error(`Error processing IMO ${imo}:`, error.message);
        errorMessages.push(`Error processing IMO ${imo}: ${error.message}`);
        failureCount.push(imo);
      }
    }



       // Move all old ops data of this loginUserId to OpsRadarHistory before adding new data
    const existingSales = await SalesRadar.find({ loginUserId: data[0].loginUserId });

    if (existingSales.length > 0) {
      // Bulk operation for moving old ops data to OpsRadarHistory and deleting from OpsRadar
      const bulkSalesHistory = [];
      const bulkSalesDelete = [];

      for (const existingSale of existingSales) {
        // Create a new OpsRadarHistory document
        bulkSalesHistory.push({
          insertOne: {
            document: existingSale.toObject(),
          },
        });

        // Prepare the delete operation for OpsRadar
        bulkSalesDelete.push({
          deleteOne: {
            filter: { _id: existingSale._id },
          },
        });
      }

      // Execute bulk operations for saving history and deleting old records
      if (bulkSalesHistory.length > 0) {
        await SalesRadarHistory.bulkWrite(bulkSalesHistory);
      }
      if (bulkSalesDelete.length > 0) {
        await SalesRadar.bulkWrite(bulkSalesDelete);
      }
    }



   // Save the sales data
   const savedDocuments = [];
   for (const row of data) {

    try{

      // Save the new document to SalesRadar
      const newSale = new SalesRadar({
        loginUserId: loginUserId,
        AdminId: AdminId,
        OrgId: OrgId,
        SalesQuotationNumber: row.SalesQuotationNumber,
        CaseId: row.CaseId,
        SalesResponsible: row.SalesResponsible,
        CustomerOwner: row.CustomerOwner,
        SPEED: row.SPEED,
        ETA: row.ETA,
        HEADING: row.HEADING,
        DISTANCE_REMAINING: row.DISTANCE_REMAINING,
        DESTINATION:row.DESTINATION,
        VesselName: row.VesselName,
        IMO: row.IMO,
        Priority: row.Priority,
        DateOfLastSentQuote: row.DateOfLastSentQuote,
        Amount: row.Amount
      });
      const savedSale = await newSale.save();
      savedDocuments.push(savedSale);

// Check if row.IMO is null, 0, undefined, or empty
if (!row.IMO) {
  console.log('Invalid IMO value. The document will not be added.');
} else {
  const requestBody2 = { 
    loginUserId,
    email,
    IMO: row.IMO,
    AdminId,
    OrgId,
    AddedDate: new Date().toISOString(),
  };

  // Check if the combination of loginUserId and IMO already exists in the database
  const existingTrackedVessel = await TrackedVesselByUser.findOne({
    loginUserId: loginUserId,
    IMO: row.IMO
  });

  if (!existingTrackedVessel) {
    // If not found, create and save the new tracked vessel record
    const newUserTrackedVessel = new TrackedVesselByUser(requestBody2);
    await newUserTrackedVessel.save();
    userTrackedData.push(newUserTrackedVessel);
  } 
}

} catch (error) {
  console.error('Error saving sales data:', error);
  res.status(500).json({ error: 'Failed to upload data' });
  return;
}
  }


    // Response with details
    res.status(200).json({
      message: "Sales Data uploaded successfully",
      savedDocuments,
      foundImos,
      notFoundImos,
      successCount,
      failureCount,
      errorMessages,
      userTrackedData, // Include user tracking data in the response
    });
  } catch (error) {
    console.error('Error uploading sales data:', error);
    res.status(500).json({ error: 'Failed to upload data' });
  }
});


  
   // API to fetch polygon geofences
   app.get('/api/get-upload-sales-data', async (req, res) => {
    try {
      const SalesRadars = await SalesRadar.find();
      res.json(SalesRadars);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      res.status(500).json({ error: 'Failed to fetch sales data' });
    }
  });

  app.post('/api/send-email', (req, res) => {
    console.log("Received request!");
  
    const { vessels } = req.body; // Expecting an array of vessels
    
    if (!Array.isArray(vessels) || vessels.length === 0) {
      return res.status(400).send('No vessels data provided');
    }
  
    // Format the vessel details
    const vesselDetails = vessels.map(vessel => {
      return `Vessel: ${vessel.vesselName}, Status: ${vessel.status}, Geofence: ${vessel.geofence}`;
    }).join('\n');
  
    // Mail options setup
    const mailOptions = {
      from:  emailUser, // Use the sender email from env variable
      bcc: 'hemanthsrinivas707@gmail.com', // Ensure this is the recipient's email
      subject: 'Vessel Status Update: Inside Vessels',
      text: `The following vessels are currently Inside:\n\n${vesselDetails}`,
    };
  
    const transporter = nodemailer.createTransport({
  
      service: 'gmail', // or another email service provider
      auth: {
          user: emailUser,
          pass: emailPass,
      }
  });
    // Sending the email using the transporter
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).send('Error sending email: ' + error.toString());
      }
      res.status(200).send('Email sent successfully: ' + info.response);
    });
  });
 


// Route to fetch specific fields from vesselstrackeds collection
app.get('/api/get-tracked-vessels', async (req, res) => {

    try {
     
        const fields = {
            IMO:1,
            AIS: 1,
            SpireTransportType: 1,
            FLAG: 1,
            GrossTonnage: 1,
            deadWeight: 1,
            trackingFlag :1,
            GeofenceStatus:1,
            geofenceFlag:1,
            GeofenceInsideTime:1,
            AisPullGfType:1,
        };

        // Fetch vessels with only the specified fields
        const trackedVessels = await TrackedVessel.find({}, fields).exec();
        
        res.json(trackedVessels);
    } catch (error) {
        console.error('Error fetching tracked vessels:', error);
        res.status(500).json({ error: 'Error fetching tracked vessels' });
    }
});

app.get('/api/get-tracked-vessels-emission', async (req, res) => {
  try {
    // Fields to return only the specified values from the database
    const fields = {
      IMO: 1,                   // imoNumber: IMO
      "AIS.NAME": 1,            // transportName: AIS.NAME
      SpireTransportType: 1,    // transportCategory: SpireTransportType
      "SpireTransportType": 1,  // transportSubCategory: SpireTransportType
      deadWeight: 1,            // buildYear: deadWeight
    };

    // Fetch vessels with only the specified fields (projection)
    const trackedVessels = await TrackedVessel.find({}, fields).exec();
    
    // Map the results to return the desired values
    const result = trackedVessels.map(vessel => ({
      imoNumber: vessel.IMO,                           // IMO as imoNumber
      transportName: vessel.AIS?.NAME || '',            // AIS.NAME as transportName
      transportCategory: vessel.SpireTransportType,    // SpireTransportType as transportCategory
      transportSubCategory: vessel.SpireTransportType, // SpireTransportType as transportSubCategory
      SpireTransportType: vessel.SpireTransportType,   // SpireTransportType as SpireTransportType
      buildYear: vessel.deadWeight                     // deadWeight as buildYear
    }));

    // Send the result to the client
    res.json(result);
  } catch (error) {
    console.error('Error fetching tracked vessels:', error);
    res.status(500).json({ error: 'Error fetching tracked vessels' });
  }
});




// app.patch('/api/delete-vessel', async (req, res) => {
//   const { imoNumbers, loginUserId } = req.body; // Destructure imoNumbers and loginUserId from the request body
//   // console.log(req.body);

//   try {
//       if (!Array.isArray(imoNumbers) || imoNumbers.length === 0) {
//           return res.status(400).json({ message: 'Invalid or missing IMO numbers' });
//       }

//       const results = [];

//       // Iterate through each IMO number to handle deletion logic
//       for (let imo of imoNumbers) {
//           // First, check the number of documents in TrackedVesselByUser with the given IMO
//           const vesselTrackingCount = await TrackedVesselByUser.countDocuments({ 'IMO': imo });
//           const vesselOpsCount = await OpsRadar.countDocuments({ 'IMO': imo, 'loginUserId': loginUserId });
//           const vesselSalesCount = await SalesRadar.countDocuments({ 'IMO': imo, 'loginUserId': loginUserId });

//           // If only one user is tracking this vessel, delete from both collections

//           if(vesselOpsCount > 0 || vesselSalesCount > 0){

//             if(vesselOpsCount > 0){
//             return res.status(400).json({ message: `Vessel with IMO ${imo} is being tracked in OPS` });
//             }

//             if(vesselSalesCount > 0){
//             return res.status(400).json({ message: `Vessel with IMO ${imo} is being tracked in Sales` });
//             }


//           }
//           else if (vesselTrackingCount === 1) {
//               // Delete the vessel from both collections
//               const deletedVessel = await TrackedVessel.deleteOne({ 'IMO': imo });
//               const deletedFromUser = await TrackedVesselByUser.deleteOne({ 'IMO': imo, 'loginUserId': loginUserId });

//               if (deletedVessel.deletedCount === 0) {
//                   return res.status(404).json({ message: `Vessel with IMO ${imo} not found in TrackedVessel` });
//               }
//               if (deletedFromUser.deletedCount === 0) {
//                   return res.status(404).json({ message: `Vessel with IMO ${imo} not found in TrackedVesselByUser` });
//               }

//               // Return successful response
//               res.status(200).json({
//                   message: `Vessel with IMO ${imo} deleted successfully from both collections`,
//                   deletedCount: 1
//               });

//           } else if (vesselTrackingCount > 1) {
//               // If more than one user is tracking this vessel, only delete from TrackedVesselByUser
//               const deletedFromUser = await TrackedVesselByUser.deleteMany({ 'IMO': imo, 'loginUserId': loginUserId });

//               if (deletedFromUser.deletedCount === 0) {
//                   return res.status(404).json({ message: `Vessel with IMO ${imo} not found for the current user` });
//               }

//               res.status(200).json({
//                   message: `Vessel with IMO ${imo} deleted from TrackedVesselByUser only`,
//                   deletedCount: 1
//               });
//           } else {
//               return res.status(404).json({ message: `No vessels found with IMO ${imo} in TrackedVesselByUser` });
//           }
//       }
//   } catch (error) {
//       console.error("Error deleting vessel:", error);
//       res.status(500).json({ message: 'Server error' });
//   }
// });





app.patch('/api/delete-vessel', async (req, res) => {
  const { imoNumbers, loginUserId } = req.body; // Destructure imoNumbers and loginUserId from the request body

  try {
    if (!Array.isArray(imoNumbers) || imoNumbers.length === 0) {
      return res.status(400).json({ message: 'Invalid or missing IMO numbers' });
    }

    const results = [];

    for (let imo of imoNumbers) {
      // First, check the number of documents in TrackedVesselByUser with the given IMO
      const vesselOpsCount = await OpsRadar.countDocuments({ 'IMO': imo, 'loginUserId': loginUserId });
      const vesselSalesCount = await SalesRadar.countDocuments({ 'IMO': imo, 'loginUserId': loginUserId });

      if (vesselOpsCount > 0) {
        await OpsRadar.deleteMany({ 'IMO': imo, 'loginUserId': loginUserId });
      }

      if (vesselSalesCount > 0) {
       await SalesRadar.deleteMany({ 'IMO': imo, 'loginUserId': loginUserId });
      }

      // Check if the vessel is tracked by only one user
      const vesselTrackingCount = await TrackedVesselByUser.countDocuments({ 'IMO': imo });

      if (vesselTrackingCount === 1) {
        const deletedVessel = await TrackedVessel.deleteOne({ 'IMO': imo });
        const deletedFromUser = await TrackedVesselByUser.deleteOne({ 'IMO': imo, 'loginUserId': loginUserId });

        if (deletedVessel.deletedCount === 0 || deletedFromUser.deletedCount === 0) {
          results.push({ imo, message: `Vessel with IMO ${imo} could not be deleted`, status: 'error' });
        } else {
          results.push({ imo, message: `Vessel with IMO ${imo} deleted successfully`, status: 'success' });
        }

      } else if (vesselTrackingCount > 1) {
        // it also deletes all duplicates
        const deletedFromUser = await TrackedVesselByUser.deleteMany({ 'IMO': imo, 'loginUserId': loginUserId });
        // after deleting above, check again if 0 then delete in trackedvessels
        if(vesselTrackingCount === 0) {
          await TrackedVessel.deleteOne({ 'IMO': imo });
        }
        
        if (deletedFromUser.deletedCount === 0) {
          results.push({ imo, message: `Vessel with IMO ${imo} not found for the current user`, status: 'error' });
        } else {
          results.push({ imo, message: `Vessel with IMO ${imo} deleted from TrackedVesselByUser only`, status: 'success' });
        }

      } else {
        results.push({ imo, message: `No vessels found with IMO ${imo} in TrackedVesselByUser`, status: 'error' });
      }
    }

    // Return all results at the end
    res.status(200).json({ results });

  } catch (error) {
    console.error("Error deleting vessel:", error);
    res.status(500).json({ message: 'Server error' });
  }
});





// Route to fetch vessels with search capability and pagination
app.get('/api/get-vessels', async (req, res) => {


    try {
        const searchQuery = req.query.search || "";
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page

        // Prepare the query for search
        const query = searchQuery ? {
            transportName: { $regex: searchQuery, $options: 'i' }
        } : {};

        // Fetch vessels with pagination
        const vessels = await Vessel.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();
        
        // Count total documents for pagination
        const total = await Vessel.countDocuments(query);
        
        res.json({
            total,
            vessels
        });
    } catch (error) {
        console.error('Error fetching vessels:', error);
        res.status(500).json({ error: 'Error fetching vessels' });
    }
});

// Route to fetch vessel data from an external API (if needed)
app.get('/api/ais-data', async (req, res) => {
    const { imo } = req.query; // Extract IMO from query parameters
   

    try {
        const response = await axios.get('https://api.vtexplorer.com/vessels', {
            params: {
                userkey,
                imo,
                format: 'json',
                sat:'1'
            }
        });
        res.json(response.data); // Send the external API response back as JSON
    } catch (error) {
        console.error('Error fetching vessel data from external API:', error);
        res.status(500).send(error.toString());
    }
});





// Endpoint to get the current intervals
app.get('/api/sat-intervals', async (req, res) => {
    try {
      const intervals = await AisSatPull.find();
      res.json(intervals);
    } catch (err) {
      res.status(500).json({ error: 'Error fetching SAT intervals' });
    }
  });


  
  // Endpoint to update the SAT intervals
  // app.put('/api/sat-intervals', async (req, res) => {
  //   try {
  //     const { sat0,sat1a,sat1b } = req.body;
  
  //     // Find the existing intervals document and update it
  //     const updatedIntervals = await AisSatPull.findOneAndUpdate({}, {
  //       sat0,
  //       sat1a,
  //       sat1b
  //     }, { new: true, upsert: true });
  //     // console.log(updatedIntervals);
  //     res.json(updatedIntervals);
  //   } catch (err) {
  //     res.status(500).json({ error: 'Error updating SAT intervals' });
  //   }
  // });

  app.post('/api/update-sat-intervals', async (req, res) => {
    try {
    const updatedSatValues  = req.body.updatedSatValues;
   
   
      for (const satValue  of updatedSatValues) {
        await AisSatPull.updateOne(
          { orgId: satValue.orgId },
          {
            $set: {
              sat0: satValue.sat0,
              sat1a: satValue.sat1a,
              sat1b: satValue.sat1b,
            },
          }
        );
      }
      res.status(200).json({ message: 'SAT intervals updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update SAT intervals', error });
    }
  });
  
  
  
  let lastEmailSentAt = null; // To track the last email sent time
  
  async function checkAndUpdateVesselData() {
      try {

          // Fetch the smallest sat0 and sat1a values across all documents
        const aisSatPullConfig = await AisSatPull.aggregate([
          {
              $group: {
                  _id: null,
                  minSat0: { $min: "$sat0" },  // Get the smallest sat0 value
                  minSat1a: { $min: "$sat1a" }, // Get the smallest sat1a value
                  minSat1b: { $min: "$sat1b" } 
                }
          }
      ]);




          if (!aisSatPullConfig) {
              console.error('Sat pull intervals not found.');
              return;
          }

          const { minSat0, minSat1a, minSat1b } = aisSatPullConfig[0]; // Extract min values for sat0 and sat1a

  
          const vessels = await TrackedVessel.find();
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
                      interval = minSat0;  // Use smallest sat0
                      sat = 0;
                  } else if (geofence.geofenceType === 'boundary') {
                      interval = minSat1a;  // Use smallest sat1a
                      sat = 1;
                  }

                      if(geofence.geofenceType === 'terrestrial'){
                        await TrackedVessel.findOneAndUpdate({IMO:IMO},{AisPullGfType:"terrestrial"});
                      }
                      if(geofence.geofenceType === 'inport'){
                        await TrackedVessel.findOneAndUpdate({IMO:IMO},{AisPullGfType:"inport"});
                      }
                      if(geofence.geofenceType === 'boundary'){
                        await TrackedVessel.findOneAndUpdate({IMO:IMO},{AisPullGfType:"boundary"});
                      }
                         
                      // console.log(`"${geofence.geofenceName}" : inside, geofenceType: ${geofence.geofenceType}`);
                      break;
                  }
              }
              if (!isInsideAnyGeofence) {
                  interval = minSat1b;
                  sat = 1;
                  // console.log("No vessels inside any geofence");
              }
              const lastFetchTime = vessel.lastFetchTime ? new Date(vessel.lastFetchTime) : null;
              const timeElapsed = lastFetchTime ? currentTime - lastFetchTime : interval;
  
              if (!lastFetchTime || timeElapsed >= interval) {
                  console.log(`Fetching VTExplorer data for ${NAME} with interval ${interval}...`);
  
                  const response = await axios.get('https://api.vtexplorer.com/vessels', {
                    params: {
                        userkey,
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
                        await TrackedVessel.updateOne({ _id: vessel._id }, { lastFetchTime: currentTime });
                    }
                  } else {
                      console.error(`Invalid data for vessel ${NAME}`);
                  }
              } else {
                  // console.log(`Skipping vessel ${NAME} (IMO: ${IMO}) - waiting for next interval...`);
              }
          }
  
           // Send consolidated email if it's time (9 AM or 2 PM)
          const currentTime = new Date();
          const currentHour = currentTime.getHours();
          
           // Check if it's 9 AM or 2 PM
           if ((currentHour === 9 || currentHour === 14) && lastEmailSentAt !== currentHour && vesselsInGeofence.length > 0) {
            sendConsolidatedEmail(vesselsInGeofence);
              
               // Update the time when the email was sent
            lastEmailSentAt = currentHour;
          }
      } catch (error) {
          console.error('Error checking and updating vessel data:', error);
      } finally {
          setTimeout(checkAndUpdateVesselData, 1000 * 60 ); // Runs the function 
      }
  }
  
 

 async function sendConsolidatedEmail(vessels) {

  if (!emailUser || !emailPass) {
    console.error('Email credentials are not available. Cannot send email.');
    return;
}

  const document = await EmailForAlerts.findOne();
  const emailvs =document.consolidated_email;

    const transporter = nodemailer.createTransport({
        service: 'gmail', // or another email service provider
        auth: {
            user: emailUser,
            pass: emailPass,
        },
    });

    // Group vessels by geofence
    const vesselsByGeofence = vessels.reduce((acc, vessel) => {
        if (!acc[vessel.geofence]) {
            acc[vessel.geofence] = [];
        }
        acc[vessel.geofence].push(vessel);
        return acc;
    }, {});




    // Generate the HTML for each geofence's table
    const emailBody = Object.keys(vesselsByGeofence)
        .map(geofence => `
            <div style="margin-bottom: 30px;">
                <h3 style="
                    color: #0F67B1; 
                    margin-bottom: 15px; 
                    font-family: Arial, sans-serif;
                    text-transform: uppercase;
                    font-size: 16px;
                ">
                    ${geofence}
                </h3>
                <table style="
                    width: 100%; 
                    border-collapse: separate; 
                    border-spacing: 0; 
                    font-family: Arial, sans-serif; 
                    font-size: 14px; 
                    text-align: left; 
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
                    border: 1px solid #DDD; 
                    border-radius: 10px; 
                    overflow: hidden;
                ">
                    <thead>
                        <tr style="
                            background-color: #0F67B1; 
                            color: #FFFFFF; 
                            text-align: left;
                            border-bottom: 2px solid #DDD;
                        ">
                            <th style="padding: 12px 15px; border-right: 1px solid #DDD;">Vessel Name</th>
                            <th style="padding: 12px 15px;">IMO</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${vesselsByGeofence[geofence]
                            .map((v, index) => `
                                <tr style="
                                    background-color: ${index % 2 === 0 ? '#F9F9F9' : '#FFFFFF'}; 
                                    border-bottom: 1px solid #DDD; 
                                    transition: background-color 0.3s ease;
                                " 
                                onmouseover="this.style.backgroundColor='#EAF3FF';" 
                                onmouseout="this.style.backgroundColor='${index % 2 === 0 ? '#F9F9F9' : '#FFFFFF'}';">
                                    <td style="padding: 10px 15px; border-right: 1px solid #DDD;">${v.NAME}</td>
                                    <td style="padding: 10px 15px;">${v.IMO}</td>
                                </tr>
                            `)
                            .join('')}
                    </tbody>
                </table>
            </div>
        `)
        .join('');

    const mailOptions = {
        from: emailUser,
        bcc: emailvs,
        subject: 'Hyla-Alert',
        html: `
            <p style="
                font-family: Arial, sans-serif; 
                font-size: 14px; 
                color: #333; 
                margin-bottom: 20px;
            ">
                The following vessels are within the Zone:
            </p>
            ${emailBody}
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}



  // Start the cron job
  checkAndUpdateVesselData();

// Define the VesselHistory schema
const vesselHistorySchema = new mongoose.Schema({
    // vesselId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrackedVessel', required: true },
    vesselName: String,
    IMO: Number,

    history: [{
        LATITUDE: Number,
        LONGITUDE: Number,
        TIMESTAMP: String,
        geofenceName: { type: String, default: null },
        geofenceFlag: { type: String, default: null },
        entryTime: { type: Date, default: null },
        exitTime: { type: Date, default: null },
    }],
    updatedAt: { type: Date, default: Date.now }
});

const VesselHistory = mongoose.model('VesselHistory', vesselHistorySchema, 'vesselHistories');


// Route to fetch all vessel history documents
app.get('/api/get-vessel-histories', async (req, res) => {
    try {
        // Find all vessel history documents
        const vesselHistories = await VesselHistory.find();
        //  console.log(vesselHistories);

        res.json(vesselHistories);
    } catch (error) {
        console.error('Error fetching vessel histories:', error);
        res.status(500).json({ error: 'Error fetching vessel histories' });
    }
});


app.get('/api/get-geofence-types', async (req, res) => {
  try {
     
      const geofenceTypes = await HylaGeofenceTypes.find();
   
      res.json(geofenceTypes);
  } catch (error) {
      console.error('Error fetching geofence types:', error);
      res.status(500).json({ error: 'Error fetching geofence types' });
  }
});


// Helper function to check if vessel is inside any geofence
const checkVesselInGeofences = (vesselLat, vesselLng, polygonGeofences, circleGeofences, polylineGeofences) => {
    const vesselPoint = turf.point([vesselLng, vesselLat]);
    let isInsideAnyGeofence = false;
    let geofenceDetails = {};
  
    // Check Polygon Geofences
    polygonGeofences.forEach((geofence) => {
      let geofenceCoordinates = geofence.coordinates.map(coord => [coord.lat, coord.lng]);
      
      // Ensure the first and last points are the same
      if (geofenceCoordinates[0][0] !== geofenceCoordinates[geofenceCoordinates.length - 1][0] || 
          geofenceCoordinates[0][1] !== geofenceCoordinates[geofenceCoordinates.length - 1][1]) {
        geofenceCoordinates.push(geofenceCoordinates[0]); // Close the polygon
      }
      
      const geofencePolygon = turf.polygon([geofenceCoordinates]);
      const isInside = turf.booleanPointInPolygon(vesselPoint, geofencePolygon);
    
      if (isInside) {
        isInsideAnyGeofence = true;
        geofenceDetails = {
          geofenceName: geofence.geofenceName,
          geofenceFlag: 'Inside',
          entryTime: new Date().toISOString(),
          exitTime: null,
          seaport: geofence.seaport,
        };
        
      }
    });
  

    // Check Circle Geofences
    circleGeofences.forEach((geofence) => {
      const { lat, lng, radius } = geofence.coordinates[0];
      const distance = turf.distance(vesselPoint, turf.point([lng, lat]), { units: 'meters' });
      if (distance <= radius) {
        isInsideAnyGeofence = true;
        geofenceDetails = {
          geofenceName: geofence.geofenceName,
          geofenceFlag: 'Inside',
          entryTime: new Date().toISOString(),
          exitTime: null,
          seaport: geofence.seaport,
        };
      }
    });
  

    // Check Polyline Geofences
    polylineGeofences.forEach((geofence) => {
      const geofenceLine = turf.lineString(geofence.coordinates.map(coord => [coord.lng, coord.lat]));
      const distanceToPolyline = turf.pointToLineDistance(vesselPoint, geofenceLine, { units: 'meters' });
      if (distanceToPolyline <= 3000) {
        isInsideAnyGeofence = true;
        geofenceDetails = {
          geofenceName: geofence.geofenceName,
          geofenceFlag: `Near ${Math.round(distanceToPolyline)} meters`,
          entryTime: new Date().toISOString(),
          exitTime: null,
          seaport: geofence.seaport,
        };
      }
    });
  
    return { isInsideAnyGeofence, geofenceDetails };
  };
  
  

  
// Helper functions to send entry and exit emails
async function sendEntryEmail(vessel, toEmails, geofenceName, seaport) {
  console.log('entered');
  console.log(seaport);

  const document = await EmailForAlerts.findOne();

  
  const mailOptions = {
    from: emailUser,
    bcc: toEmails , 
    subject: `${vessel.AIS.NAME} arrived ${geofenceName} - ${seaport}`,
    text: `${vessel.AIS.NAME} (IMO: ${vessel.AIS.IMO}) has arrived ${geofenceName} - ${seaport}.`
  };

  try {
    // Create a transporter object with SMTP transport
const transporter = nodemailer.createTransport({

service: 'gmail', // or another email service provider
auth: {
    user: emailUser,
    pass: emailPass,
}
});
    await transporter.sendMail(mailOptions);
    console.log('Entry email sent successfully');
  } catch (error) {
    console.error('Error sending entry email:', error);
  }
}

async function sendExitEmail(vessel, toEmails,  geofenceName) {
  const document = await EmailForAlerts.findOne();
  const email =document.email;
  
  const mailOptions = {
    from: emailUser,
    bcc: toEmails, 
    subject: `${vessel.AIS.NAME} departed ${geofenceName}`,
    text: `${vessel.AIS.NAME} (IMO: ${vessel.AIS.IMO}) has departed ${geofenceName}.`
  };

  try {
    // Create a transporter object with SMTP transport
const transporter = nodemailer.createTransport({

service: 'gmail', // or another email service provider
auth: {
    user: emailUser,
    pass: emailPass,
}
});
    await transporter.sendMail(mailOptions);
    console.log('Exit email sent successfully');
  } catch (error) {
    console.error('Error sending exit email:', error);
  }
}



  app.put(`/api/updateVesselLocation/:IMO`, async (req, res) => {
    const { LATITUDE, LONGITUDE, TIMESTAMP, COURSE, SPEED, HEADING, NAVSTAT, CALLSIGN, TYPE, A, B, C, D, DRAUGHT, DESTINATION, LOCODE, ETA_AIS, ETA, SRC, ZONE, ECA, DISTANCE_REMAINING, ETA_PREDICTED } = req.body;
    const IMO = req.params.IMO;
   
    try {

      console.log('got into api',IMO);

      // Fetch the vessel and geofences
      const vessel = await TrackedVessel.findOne({ IMO:IMO });
   

 // Find documents with the given IMO value
    const vesselsByUser = await TrackedVesselByUser.find({ IMO });

//when nobody is tracking but trying to update data , it throws error
//  if (!vesselsByUser.length) {
//      return res.status(404).json({ message: 'No vessels found with the given IMO' });
//  }


 const toEmails = Array.from(
  new Set(
    vesselsByUser
      .map(vessel => vessel.email) // Extract email
      .filter(email => email && email.trim()) // Filter valid emails
      .map(email => email.trim()) // Trim spaces
  )
);

// const toEmails ="udhaykirank@adyapragnya.com" ;


      console.log(toEmails);

     
      if (!vessel) {
        return res.status(404).json({ message: `Vessel with IMO ${IMO} not found` });
    }

      const polygonGeofences = await PolygonGeofence.find();
      const circleGeofences = await Geofence.find();
      const polylineGeofences = await PolylineGeofence.find();
  
      // Check if the vessel is inside any geofences
      const { isInsideAnyGeofence, geofenceDetails } = checkVesselInGeofences(LATITUDE, LONGITUDE, polygonGeofences, circleGeofences, polylineGeofences);
            // Log geofence details for debugging
            // console.log('Geofence Details:', geofenceDetails);
      // Check if VesselHistory exists for this vesselId
      let vesselHistory = await VesselHistory.findOne({ IMO });
      let previousHistory = vesselHistory ? vesselHistory.history[vesselHistory.history.length - 1] : null;
  
      // Handle entryTime and exitTime
      if (previousHistory) {
        // If vessel is inside the same geofence, keep the previous entryTime
        if (previousHistory.geofenceName === geofenceDetails.geofenceName) {
          geofenceDetails.entryTime = previousHistory.entryTime;
        } 
  
        // If vessel exited the previous geofence, set the exit time
        if (previousHistory.geofenceName && !geofenceDetails.geofenceName) {
          previousHistory.exitTime = new Date().toISOString();
          geofenceDetails.exitTime = null;

          // Send email for exiting geofence
        await sendExitEmail(vessel, toEmails, previousHistory.geofenceName);
        }
      }
  
      // Build the history entry
      const historyEntry = {
        LATITUDE,
        LONGITUDE,
        TIMESTAMP,
        ...(isInsideAnyGeofence ? geofenceDetails : { geofenceFlag: 'Outside', exitTime: null })
      };
    
      // Create or update vessel history
      if (!vesselHistory) {
        vesselHistory = new VesselHistory({
          // vesselId: vessel._id,
          vesselName: vessel.AIS.NAME,
          IMO: vessel.AIS.IMO,
          history: [historyEntry]
        });
      } else {
        vesselHistory.history.push(historyEntry);
      }
    
      // Save vessel history
      await vesselHistory.save();
    
      // Check if this is the first time the vessel entered this geofence
      if (!previousHistory || (previousHistory.geofenceName !== geofenceDetails.geofenceName)) {
        if (geofenceDetails.geofenceName) { // Check if geofenceName is defined
            geofenceDetails.entryTime = new Date().toISOString();
          
          
            await sendEntryEmail(vessel, toEmails, geofenceDetails.geofenceName,geofenceDetails.seaport);
            
          
        }
    }
    
    
      // Update TrackedVessel
      await TrackedVessel.findOneAndUpdate({ IMO }, {
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
  
      res.status(200).json({ message: 'Vessel location and history updated successfully' });
    } catch (error) {
      console.error('Error updating vessel location:', error);
      res.status(500).json({ message: 'Error updating vessel location', error });
    }
});



  
// 17-10-2024-start
// Save vessel history 
// app.post('/api/vesselHistory/:id', async (req, res) => {
//     const { LATITUDE, LONGITUDE, TIMESTAMP, geofenceName, geofenceFlag } = req.body;
//     const vesselName = req.params.id;

//     try {
//         if (!vesselName) {
//             return res.status(400).json({ error: 'Invalid vessel name' });
//         }

//         // Find the vessel history entry for the given vessel name
//         let historyEntry = await VesselHistory.findOne({ vesselName });

//         if (!historyEntry) {
//             // If no history exists, create a new entry
//             historyEntry = new VesselHistory({
//                 vesselName,
//                 history: [{ LATITUDE, LONGITUDE, TIMESTAMP, geofenceName, geofenceFlag }]
//             });
//         } else {
//             // Get the last history object from the array
//             const lastHistory = historyEntry.history[historyEntry.history.length - 1];

//             // Compare both LATITUDE and LONGITUDE with the previous entry
//             const isSameLocation = lastHistory &&
//                 lastHistory.LATITUDE === LATITUDE &&
//                 lastHistory.LONGITUDE === LONGITUDE;

//             // Only add new history entry if the location has changed
//             if (!isSameLocation) {
//                 // Ensure geofenceName and geofenceFlag are not null before adding the entry
//                 if (geofenceName && geofenceFlag) {
//                     historyEntry.history.push({ LATITUDE, LONGITUDE, TIMESTAMP, geofenceName, geofenceFlag });
//                 } else {
//                     return res.status(400).json({ error: 'Missing geofenceName or geofenceFlag' });
//                 }
//             }
//         }

//         // Save the updated history entry
//         await historyEntry.save();
//         res.status(200).json({ message: 'History saved' });
//     } catch (error) {
//         console.error('Error saving vessel history:', error);
//         res.status(500).json({ error: 'Failed to save history' });
//     }
// });


// 17-10-2024-end

// Get vessel history by vessel ID


// app.get('/api/getvesselHistory/:id', async (req, res) => {
//     const vesselId = req.params.id;

//     try {
//         if (!vesselId || !mongoose.isValidObjectId(vesselId)) {
//             return res.status(400).json({ error: 'Invalid vessel ID' });
//         }

//         const historyEntry = await VesselHistory.findOne({ vesselId });

//         if (!historyEntry) {
//             return res.status(404).json({ error: 'History not found for this vessel' });
//         }

//         res.status(200).json(historyEntry);
//     } catch (error) {
//         console.error('Error retrieving vessel history:', error);
//         res.status(500).json({ error: 'Failed to retrieve vessel history' });
//     }
// });

// app.put('/api/updateVesselFlag/:id', async (req, res) => {
//     const { geofenceFlag } = req.body;
//     const vesselId = req.params.id;

//     try {
//         if (!vesselId || !mongoose.isValidObjectId(vesselId)) {
//             return res.status(400).json({ error: 'Invalid vessel ID' });
//         }

//         const vessel = await TrackedVessel.findById(vesselId);
//         if (vessel) {
//             vessel.geofenceFlag = geofenceFlag; // Update the geofenceFlag field
//             await vessel.save();
//             res.status(200).json({ message: 'Geofence flag updated successfully' });
//         } else {
//             res.status(404).json({ error: 'Vessel not found' });
//         }
//     } catch (error) {
//         console.error('Error updating geofence flag:', error);
//         res.status(500).json({ error: 'Failed to update geofence flag' });
//     }
// });




// analytics







// Get items API endpoint (protected by access key)
// 1
app.get('/api/AisSatPull', async (req, res) => {

  const accessKey = req.header('x-access-key');
  
if(accessKey == process.env.EXTERNAL_ANALYTICS_ACCESS_KEY){
  try {
    const items = await AisSatPull.find(); // Get all items from the collection
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
}
else{
  return res.status(403).json({ message: 'Forbidden: Invalid or missing access key' });
}

});

//  2 circle geofence
app.get('/api/Geofence', async (req, res) => {

  const accessKey = req.header('x-access-key');
  
if(accessKey == process.env.EXTERNAL_ANALYTICS_ACCESS_KEY){
  try {
    const items = await Geofence.find(); // Get all items from the collection
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
}
else{
  return res.status(403).json({ message: 'Forbidden: Invalid or missing access key' });
}

});

// 3

app.get('/api/OpsRadar', async (req, res) => {

  const accessKey = req.header('x-access-key');
  
if(accessKey == process.env.EXTERNAL_ANALYTICS_ACCESS_KEY){
  try {
    const items = await OpsRadar.find(); // Get all items from the collection
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
}
else{
  return res.status(403).json({ message: 'Forbidden: Invalid or missing access key' });
}

});

// 4
app.get('/api/LoginUsers', async (req, res) => {

  const accessKey = req.header('x-access-key');
  
if(accessKey == process.env.EXTERNAL_ANALYTICS_ACCESS_KEY){
  try {
    const items = await LoginUsers.find(); // Get all items from the collection
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
}
else{
  return res.status(403).json({ message: 'Forbidden: Invalid or missing access key' });
}

});

// 5
app.get('/api/OpsRadarHistory', async (req, res) => {

  const accessKey = req.header('x-access-key');
  
if(accessKey == process.env.EXTERNAL_ANALYTICS_ACCESS_KEY){
  try {
    const items = await OpsRadarHistory.find(); // Get all items from the collection
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
}
else{
  return res.status(403).json({ message: 'Forbidden: Invalid or missing access key' });
}

});

// 6
app.get('/api/Organization', async (req, res) => {

  const accessKey = req.header('x-access-key');
  
if(accessKey == process.env.EXTERNAL_ANALYTICS_ACCESS_KEY){
  try {
    const items = await Organization.find(); // Get all items from the collection
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
}
else{
  return res.status(403).json({ message: 'Forbidden: Invalid or missing access key' });
}

});

// 7
app.get('/api/OrganizationISM', async (req, res) => {

  const accessKey = req.header('x-access-key');
  
if(accessKey == process.env.EXTERNAL_ANALYTICS_ACCESS_KEY){
  try {
    const items = await OrganizationISM.find(); // Get all items from the collection
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
}
else{
  return res.status(403).json({ message: 'Forbidden: Invalid or missing access key' });
}

});

// 8
app.get('/api/PolygonGeofence', async (req, res) => {

  const accessKey = req.header('x-access-key');
  
if(accessKey == process.env.EXTERNAL_ANALYTICS_ACCESS_KEY){
  try {
    const items = await PolygonGeofence.find(); // Get all items from the collection
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
}
else{
  return res.status(403).json({ message: 'Forbidden: Invalid or missing access key' });
}

});

// 9
app.get('/api/SalesISM', async (req, res) => {

  const accessKey = req.header('x-access-key');
  
if(accessKey == process.env.EXTERNAL_ANALYTICS_ACCESS_KEY){
  try {
    const items = await SalesISM.find(); // Get all items from the collection
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
}
else{
  return res.status(403).json({ message: 'Forbidden: Invalid or missing access key' });
}

});


// 10
app.get('/api/SalesRadar', async (req, res) => {

  const accessKey = req.header('x-access-key');
  
if(accessKey == process.env.EXTERNAL_ANALYTICS_ACCESS_KEY){
  try {
    const items = await SalesRadar.find(); // Get all items from the collection
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
}
else{
  return res.status(403).json({ message: 'Forbidden: Invalid or missing access key' });
}

});

// 11
app.get('/api/TerrestrialGeofence', async (req, res) => {

  const accessKey = req.header('x-access-key');
  
if(accessKey == process.env.EXTERNAL_ANALYTICS_ACCESS_KEY){
  try {
    const items = await TerrestrialGeofence.find(); // Get all items from the collection
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
}
else{
  return res.status(403).json({ message: 'Forbidden: Invalid or missing access key' });
}

});


// 12
app.get('/api/TrackedVessel', async (req, res) => {

  const accessKey = req.header('x-access-key');
  
if(accessKey == process.env.EXTERNAL_ANALYTICS_ACCESS_KEY){
  try {
    const items = await TrackedVessel.find(); // Get all items from the collection
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
}
else{
  return res.status(403).json({ message: 'Forbidden: Invalid or missing access key' });
}

});


// 13
app.get('/api/TrackedVesselByUser', async (req, res) => {

  const accessKey = req.header('x-access-key');
  
if(accessKey == process.env.EXTERNAL_ANALYTICS_ACCESS_KEY){
  try {
    const items = await TrackedVesselByUser.find(); // Get all items from the collection
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
}
else{
  return res.status(403).json({ message: 'Forbidden: Invalid or missing access key' });
}

});

// 14
app.get('/api/TrackedVesselISM', async (req, res) => {

  const accessKey = req.header('x-access-key');
  
if(accessKey == process.env.EXTERNAL_ANALYTICS_ACCESS_KEY){
  try {
    const items = await TrackedVesselISM.find(); // Get all items from the collection
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
}
else{
  return res.status(403).json({ message: 'Forbidden: Invalid or missing access key' });
}

});

// 15



// chatbot starts

// Environment variable validation
if (!openaiAPI) {
  console.error('Error: Missing OpenAI API key.');
 
 }
 

 // Rate limiter to prevent abuse
 const apiLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests. Please try again later.' },
 });
 
 // Middleware for validating incoming queries
 const validateQuery = (req, res, next) => {
  const { query } = req.body;
  if (!query || typeof query !== 'string' || query.trim() === '') {
  return res.status(422).json({ error: 'Query is required and must be a non-empty string.' });
  }
  next();
 };



 // GPT Query Endpoint
 app.post('/api/gpt-query', apiLimiter, validateQuery, async (req, res) => {
  try {
    const { query } = req.body;

    // Fetch all vessels
    const vessels = await TrackedVessel.find();

    // Extract relevant vessel data
    const vesselData = vessels.map(vessel => ({
      IMO: vessel.IMO,
      VesselName: vessel.AIS.NAME,
      Type: vessel.SpireTransportType,
      MMSI: vessel.AIS.MMSI,
      Latitude: vessel.AIS.LATITUDE,
      Longitude: vessel.AIS.LONGITUDE,
      Timestamp: vessel.AIS.TIMESTAMP,
      Speed: vessel.AIS.SPEED,
      Course: vessel.AIS.COURSE,
      Heading: vessel.AIS.HEADING,
      NavigationStatus: vessel.AIS.NAVSTAT,
      Destination: vessel.AIS.DESTINATION,
      ETA: vessel.AIS.ETA || 'Not Available',
      Source: vessel.AIS.SRC,
      Zone: vessel.AIS.ZONE,
      DistanceRemaining: vessel.AIS.DISTANCE_REMAINING,
      GrossTonnage: vessel.GrossTonnage || 'Not Available',
      DeadWeight: vessel.deadWeight || 'Not Available',
      Flag: vessel.FLAG || 'Not Available',
      LastFetchTime: vessel.lastFetchTime || 'Not Available',
      RegionName: vessel.AisPullGfType,
    }));

    // Find vessels matching the query
    const matchingVessels = vesselData.filter(vessel =>
      query.toLowerCase().includes(vessel.VesselName.toLowerCase()) ||
      query.includes(vessel.IMO)
    );

    let contextMessage = `User's Query: ${query}. Here are the details of the tracking vessels. please give short answers only what user is asking and don't elaborate:\n`;

    let vesselResponse = [];

    if (matchingVessels.length > 0) {

      // If specific vessels are found, return them
      matchingVessels.forEach((vessel) => {
        contextMessage += `
          Name: ${vessel.VesselName},
          IMO: ${vessel.IMO},
          Speed: ${vessel.Speed},
          ETA: ${vessel.ETA},
          RegionName: ${vessel.RegionName},
          Type: ${vessel.Type},
          Latitude: ${vessel.Latitude},
          Longitude: ${vessel.Longitude},
          Course: ${vessel.Course},
          Heading: ${vessel.Heading},
          NavigationStatus: ${vessel.NavigationStatus},
          Destination: ${vessel.Destination},
          Zone: ${vessel.Zone},
          DistanceRemaining: ${vessel.DistanceRemaining},
          LastFetchTime: ${vessel.LastFetchTime},
          Flag: ${vessel.Flag},
        `;
        
        vesselResponse.push({
          text: ``,
          sender: 'Bot',
          LocateVesselButtonUrl: {
            name: vessel.VesselName,
            imo: vessel.IMO,
            Speed: vessel.Speed,
            eta: vessel.ETA,
            RegionName: vessel.RegionName,
            SpireTransportType: vessel.Type,
            lat: vessel.Latitude,
            lng: vessel.Longitude,
            Course: vessel.Course,
            heading: vessel.Heading,
            NavigationStatus: vessel.NavigationStatus,
            destination: vessel.Destination,
            Zone: vessel.Zone,
            DistanceRemaining: vessel.DistanceRemaining,
            LastFetchTime: vessel.LastFetchTime
          }
        });
      });
    } else {
      // No matching vessels, still return general vessel data but without the button
      // vesselResponse = [] ;

      vesselData.forEach((vessel) => {
        contextMessage += `
          Name: ${vessel.VesselName},
          IMO: ${vessel.IMO},
          Speed: ${vessel.Speed},
          ETA: ${vessel.ETA},
          RegionName: ${vessel.RegionName},
          Type: ${vessel.Type},
          Latitude: ${vessel.Latitude},
          Longitude: ${vessel.Longitude},
          Course: ${vessel.Course},
          Heading: ${vessel.Heading},
          NavigationStatus: ${vessel.NavigationStatus},
          Destination: ${vessel.Destination},
          Zone: ${vessel.Zone},
          DistanceRemaining: ${vessel.DistanceRemaining},
          LastFetchTime: ${vessel.LastFetchTime},
          Flag: ${vessel.Flag},
        `;;
    }
  );
}
    // Send the response to OpenAI and the client
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: contextMessage,
          },
        ],
        max_tokens: 200,
      },
      {
        headers: {
          Authorization: `Bearer ${openaiAPI}`,
        },
      }
    );

    res.status(200).json({
      response: openaiResponse.data.choices[0].message.content,
      vesselData: vesselResponse,  // Always send vesselData, even if it's empty
    });

  } catch (error) {
    console.error('Error querying OpenAI API:', error.message);
    res.status(500).json({ error: 'An error occurred while querying GPT.' });
  }
});


    // app.get('/api/get-tracked-vessels-details', async (req, res) => {
    //   try {
          
    //       const vessels = await TrackedVessel.find();
         
    //       const vesselData = vessels.map(vessel => {
    //         return {
    //             IMO: vessel.IMO,
    //             VesselName: vessel.AIS.NAME,
    //             ShipName: vessel.AIS.NAME,
    //             Type: vessel.SpireTransportType,
    //             MMSI: vessel.AIS.MMSI,
    //             Latitude: vessel.AIS.LATITUDE,
    //             Longitude: vessel.AIS.LONGITUDE,
    //             Timestamp: vessel.AIS.TIMESTAMP,
    //             Speed: vessel.AIS.SPEED,
    //             Course: vessel.AIS.COURSE,
    //             Heading: vessel.AIS.HEADING,
    //             NavigationStatus: vessel.AIS.NAVSTAT,
    //             Destination: vessel.AIS.DESTINATION,
    //             ETA: vessel.AIS.ETA || 'Not Available',
    //             Source: vessel.AIS.SRC,
    //             Zone: vessel.AIS.ZONE,
    //             DistanceRemaining: vessel.AIS.DISTANCE_REMAINING,
    //             GrossTonnage: vessel.GrossTonnage || 'Not Available',
    //             DeadWeight: vessel.deadWeight || 'Not Available',
    //             Flag: vessel.FLAG || 'Not Available',
    //             LastFetchTime: vessel.lastFetchTime || 'Not Available',
    //             RegionName: vessel.AisPullGfType,
                
    //         };
    //     });

    //     res.json(vesselData);
    //   } catch (error) {
    //       console.error('Error fetching tracked vessels ', error);
    //       res.status(500).json({ error: 'Error fetching tracked vessels ' });
    //   }
    // });



// chatbot ends

// commented on 13/02/25
// API Endpoint to fetch emission form data
app.get('/api/get-latestAISData-on-submit/:IMO', async (req, res) => {
  const { IMO } = req.params;

  try {
    
    // Fetch latest AIS data (TrackedVessel)
    const latestAISData = await TrackedVessel.findOne({
      // 'AIS.ETA': timeTenderedAt,
      IMO
    });

    if (!latestAISData) {
      return res.status(404).json({ message: 'Latest AIS data not found' });
    }

    // Combine the transport and AIS data
    const responseData = {
      latestAISData: latestAISData.AIS,
    };

    res.json({ data: responseData });
  } catch (error) {
    console.error('Error fetching latestAISData data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



app.get('/api/get-ports', async (req, res) => {
  try {
    const ports = await Port.find({});
    res.status(200).json(ports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ports', error });
  }
});


app.get('/api/get-voyages', async (req, res) => {
  try {
    // Fetch all voyages
    const voyages = await Voyages.find({});

    // Create a result array to hold the mapped voyages
    const mappedVoyages = [];

    for (let voyage of voyages) {
      // Find the related port by the port field in the voyage document
      const port = await Port.findOne({ name: voyage.port });

      if (!port) {
        return res.status(404).json({ message: 'Port not found for voyage' });
      }


      // const vessel = await TrackedVessel.findOne({ IMO: voyage.IMO });

      const masterVessel = await Vessel.findOne({ imoNumber: voyage.IMO });

      const trackedVessel = await TrackedVessel.findOne({ IMO: voyage.IMO });


      if (!masterVessel ) {
        return res.status(404).json({ message: 'Master Vessel not found for voyage' });
      }

      if (!trackedVessel ) {
        return res.status(404).json({ message: 'Tracked Vessel not found for voyage' });
      }


      // Map the Voyage document to the desired format
      const mappedVoyage = {
       
        _id: voyage._id,
        transport: masterVessel ,
        AISETA: trackedVessel.AIS.ETA,
        port: port,
        name: voyage.name,  // This maps the voyage name directly to the result
        IMO: voyage.IMO,
        status: voyage.status,  // Retain other fields as necessary
        isActive: voyage.isActive,
        ETB: voyage.ETB == "1970-01-01T00:00:00.000Z" || 0 ? null : voyage.ETB,
        BerthName: voyage.BerthName,
        ATB: voyage.ATB && voyage.ATB !== "1970-01-01T00:00:00.000Z" ? voyage.ATB : null,   
        A_Berth: voyage.A_Berth 

      };

      // Add the mapped voyage to the result
      mappedVoyages.push(mappedVoyage);
    }
    // console.log(mappedVoyages);
    // Return the transformed voyage data
    res.status(200).json(mappedVoyages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching voyages', error });
  }
});


// Define the endpoint to calculate the distance
// app.get('/api/distance/:longitude1/:latitude1/:longitude2/:latitude2', async (req, res) => {
//   const { longitude1, latitude1, longitude2, latitude2 } = req.params;

//   // External API URL

//   const url = `https://api.vtexplorer.com/distance?userkey=${userkey}&from=${longitude1},${latitude1}&to=${longitude2},${latitude2}`;

//   try {
//     // Call the external API to get the distance
//     const externalRes = await fetch(url);

//     // Check if the external API responded successfully
//     if (!externalRes.ok) {
//       return res.status(500).json({ message: 'Error fetching distance data from external API' });
//     }

//     // Parse the JSON response from the external API
//     const distanceData = await externalRes.json();

//     // Respond with the fetched distance data
//     res.status(200).json(distanceData);
//   } catch (error) {
//     console.error('Error fetching distance:', error);
//     res.status(500).json({ message: 'Server error while fetching distance', error });
//   }
// });

// Use alert routes


// Endpoint to handle saving the JIT report
app.post('/api/jit-report', async (req, res) => {
  const { reportData } = req.body;
  
  try {
    // Create a new JIT Report instance
    const newReport = new JitReport({
      VoyageId: reportData.VoyageId,
      VoyageName: reportData.VoyageName,
      VesselName: reportData. VesselName,
      port: reportData.port,
      IMO: reportData.IMO,
      CalculatedData: reportData.CalculatedData,
      EmissionData: reportData.EmissionData
      
    });

    // Save the new report to the database
    await newReport.save();

    // Return success response
    res.status(200).json({ message: 'JIT Report saved successfully', reportId: newReport._id });
  } catch (error) {
    console.error('Error saving JIT Report:', error);
    res.status(500).json({ message: 'Failed to save JIT Report', error: error.message });
  }
});

// commented on 13/02/25
// API Endpoint to fetch emission form data
app.get('/api/get-JITreport', async (req, res) => {


  try {
    const data = await JitReport.find(); // Adjust if necessary
        res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching JITreport data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



app.use('/api/alert', alertRoutes);

// Routes
app.use('/api/organizations', organizationRoutes);

app.use('/api/ism-organizations', organizationISMRoutes);

// Routes
app.use('/api/users', userRoutes);

// Use the login routes
app.use('/api/signin', loginRoutes);

// Routes
app.use('/api/customfields', customFieldsRoutes);

// Serve the uploads directory as static
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  


  

// Start the server and listen on the specified port
app.listen(port,'0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});





