import mongoose from 'mongoose';


const JitReportSchema = new mongoose.Schema({

    VoyageId: { type: String, required: true},
    VoyageName: { type: String, required: true},
    VesselName: { type: String},
    port: { type: String},

    IMO: Number,
    CalculatedData: {
        JitEta: Date,
        pointOfSpeedReduction: Date,
        ETB: Date,
        currentDTG: Number,
        positionReportedAt: Date,
        currentETA: Date,
        currentSpeed: Number,
        dtgAtVirtualNOR: Number,
        speedToMaintainETB: Number
    },

    EmissionData: [{
        speed: Number,
        ETA: Date,
        EWT: Number,
        CO2: Number,
        SOx: Number,
        NOx: Number,
        totalConsumption: Number
    }],
 
}, { timestamps: true });

const JitReport = mongoose.model('JITReport', JitReportSchema, 'JITReport');


export default  JitReport ;



