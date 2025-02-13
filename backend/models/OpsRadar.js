import mongoose from 'mongoose';


const OpsRadarSchema = new mongoose.Schema({
    loginUserId: String,
    AdminId: String,
    OrgId: String,
    
    IMO : Number,
    CaseId : Number,
    Agent : String,
    AgentName : String,
    Info1 : String,
    ETA : String,
   
  

}, { timestamps: true });

const OpsRadar = mongoose.model('opsradar', OpsRadarSchema, 'opsradar');


// Export the model
export default  OpsRadar ;
