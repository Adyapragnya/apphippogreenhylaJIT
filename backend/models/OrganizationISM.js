// models/Organization.js
import mongoose from 'mongoose';


const organizationISMSchema = new mongoose.Schema({
  orgId: { type: String, required: true },
  companyTitle: { type: String, required: true },
  companyName: { type: String, required: true },
  address: { type: String, required: true },

});

const OrganizationISM =  mongoose.model('organizationsISM', organizationISMSchema, 'organizationsISM');

export default   OrganizationISM ;
