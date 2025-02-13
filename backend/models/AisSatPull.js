import mongoose from 'mongoose';

// Schema for NAVSTAT intervals that can be edited in the database, now per organization
const aisSatPullSchema = new mongoose.Schema({


  orgObjectId: {
    type: mongoose.Schema.Types.ObjectId, // Assuming orgId is a reference to Organization collection
    ref: 'Organization', // Reference to the Organization model
    required: true,
  },

  orgId:{ type: String, required: true },

  companyName: { type: String, required: true },

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
const AisSatPull = mongoose.model('aisSatPull', aisSatPullSchema,'aisSatPull');

export default  AisSatPull;

