import mongoose from "mongoose";

const tagSchema = new mongoose.Schema({
  tagName: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },

  course: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
});

export default mongoose.model("Tag", tagSchema);
