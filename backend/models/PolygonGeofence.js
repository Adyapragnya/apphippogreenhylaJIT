import mongoose from 'mongoose';

const PolygonGeofenceSchema = new mongoose.Schema({
    geofenceId: String,
    geofenceName: String,
    geofenceType: String,
    date: String,
    remarks: String,
    seaport: String,
    coordinates: Array,
    
  });

const PolygonGeofence = mongoose.model('PolygonGeofence', PolygonGeofenceSchema);

export default  PolygonGeofence ;
