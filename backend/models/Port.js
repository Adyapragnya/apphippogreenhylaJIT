import mongoose from 'mongoose';


const PortSchema = new mongoose.Schema({
    
    name : String,
    lat : Number,
    long : Number,
    UNLOCODE : String,
    isActive : Boolean,
   

}, { timestamps: true });

const Port = mongoose.model('ports', PortSchema , 'ports');


// Export the model
export default   Port ;



