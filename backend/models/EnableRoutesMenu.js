import mongoose from 'mongoose';


const EnableRoutesMenuSchema = new mongoose.Schema({
    salesOrgId:  String ,
    opsOrgId:  String ,
    mainDashboardOrgId:  String ,
 
}, { timestamps: true });

const EnableRoutesMenu = mongoose.model('enableroutesmenu', EnableRoutesMenuSchema, 'enableroutesmenu');


// Export the model
export default  EnableRoutesMenu ;

