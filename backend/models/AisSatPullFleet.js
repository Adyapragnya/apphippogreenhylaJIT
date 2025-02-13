import mongoose from 'mongoose';

// Schema for NAVSTAT intervals that can be edited in the database, now per organization
const aisSatPullFleetSchema = new mongoose.Schema({


 

  aisuserkey:{ type: String, required: true },

  trackVessels: { type: Boolean, required: true },

  sat0: {
    type: Number,
    required: true,
    // default: 1000 * 60 * 15, 
  },
  sat1a: {
    type: Number,
    required: true,
    // default: 1000 * 60 * 480,
  },
  sat1b: {
    type: Number,
    required: true,
    // default: 1000 * 60 * 480,
  },
}, { timestamps: true }); // Adding timestamps to track changes


// Create the model
const AisSatPullFleet = mongoose.model('aisSatPullFleets', aisSatPullFleetSchema ,'aisSatPullFleets');

export default  AisSatPullFleet;

