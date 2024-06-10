import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  otp: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 5 * 60,
  },
});

export default mongoose.model("Otp", otpSchema);
