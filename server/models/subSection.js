import mongoose from "mongoose";

const subSectionSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  timeDuration: {
    type: String,
  },
  description: {
    type: string,
  },
  videoUrl: {
    type: String,
  },
});

export default mongoose.model("subSection", subSectionSchema);
