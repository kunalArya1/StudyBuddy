import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  gender: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
  },
  about: {
    type: String,
    required: true,
    trim: true,
  },
  contactNumber: {
    type: Number,
    trim: true,
  },
});

export default mongoose.model("profile", userSchema);
