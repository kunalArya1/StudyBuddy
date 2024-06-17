import mongoose from "mongoose";

const courseProgressSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  completeVideo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subSection",
    },
  ],
});
export default mongoose.model("CourseProgress", courseProgressSchema);
