import mongoose from 'mongoose';

const HylaGeofenceTypesSchema = new mongoose.Schema({
    geofenceType :Array

}, { timestamps: true });

const HylaGeofenceTypes = mongoose.model('hylageofencetypes', HylaGeofenceTypesSchema, 'hylageofencetypes');


// Export the model
export default   HylaGeofenceTypes ;

