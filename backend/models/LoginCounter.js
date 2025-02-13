import mongoose from 'mongoose';


const CounterSchema = new mongoose.Schema({
    seq: { type: Number, default: 1, required: true } // Starts from 1
  });
  
  export default  mongoose.model('LoginCounter', CounterSchema);
  