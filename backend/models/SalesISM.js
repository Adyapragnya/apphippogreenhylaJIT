import mongoose from 'mongoose';


const SalesISMSchema = new mongoose.Schema({
    
    OrgId : String,
    CompanyTitle : String,
    
    IMO : Number,
    VesselName : String,
    GrossTonnage : Number,
    ShipType : String,
    YearOfBuild : Number,
    CurrentFlag : String,
    CurrentClass : String,
    ManagementOffice : String,
    SPEED : Number,
    HEADING : Number,
    DISTANCE_REMAINING : Number,
    CustomerOwner: String,
    ETA: String,
    DESTINATION: String


}, { timestamps: true });

const SalesISM = mongoose.model('salesISM', SalesISMSchema , 'salesISM');


// Export the model
export default   SalesISM ;




