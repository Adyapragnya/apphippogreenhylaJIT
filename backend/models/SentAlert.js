// models/SentAlert.js
import mongoose from 'mongoose';


const sentAlertSchema = new mongoose.Schema({
  vesselId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrackedVessel', required: true },
  alertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alert', required: true },
}, { timestamps: true });

const SentAlert = mongoose.model('SentAlert', sentAlertSchema);
export default  SentAlert;
