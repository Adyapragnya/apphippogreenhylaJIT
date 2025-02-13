import mongoose from 'mongoose';


const EmailForAlertsSchema = new mongoose.Schema({
  
  email: { type: String },
  vesseladdemail : { type: String },
  consolidated_email : { type: String },
}, { timestamps: true });


export default  mongoose.model('EmailForAlerts', EmailForAlertsSchema,'emailsforalerts');
