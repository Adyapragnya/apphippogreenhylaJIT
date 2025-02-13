import mongoose from 'mongoose';

const CounterSchema = new mongoose.Schema({
  userId: { type: Number, default: 1000 }, // Start with 0 or another number based on your requirement
});

const UserCounter = mongoose.model('UserCounter', CounterSchema);

export default  UserCounter;