import mongoose from 'mongoose';


const LoginUserSchema = new mongoose.Schema({
  loginUserId: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });


export default  mongoose.model('LoginUsers', LoginUserSchema);
