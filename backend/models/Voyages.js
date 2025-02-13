import mongoose from 'mongoose';


const VoyagesSchema = new mongoose.Schema({
    
    name : String,
    port : String,
    IMO  : Number,
    ETB  : Date,
    BerthName  : String,
    ATB  : Date,
    A_Berth  : String,
    status  : String,
    isActive : Boolean,
    ETA: Date,
    SPEED : Number
   

}, { timestamps: true });

const Voyages = mongoose.model('voyages', VoyagesSchema , 'voyages');


// Export the model
export default   Voyages ;



