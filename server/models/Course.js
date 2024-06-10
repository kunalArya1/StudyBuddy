import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: true,
    trim: true,
  },
  courseDescription: {
    type: String,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  whatYouWillLearn: {
    type: String,
  },
  courseContent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
  ],
  thumbnail: {
    type: String,
  },
  ratingAndReview: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RatingAndReview",
    },
  ],
  price: {
    type: Number,
    required: true,
  },
  tag: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tag",
  },
  studetEnrolled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
});

export default mongoose.model("Course", courseSchema);
