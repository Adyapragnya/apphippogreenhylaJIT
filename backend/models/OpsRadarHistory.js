import mongoose from 'mongoose';


const OpsRadarHistorySchema = new mongoose.Schema({
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

const OpsRadarHistory = mongoose.model('opsradarhistory', OpsRadarHistorySchema, 'opsradarhistory');


// Export the model
export default  OpsRadarHistory ;
