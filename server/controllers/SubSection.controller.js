import SubSection from "../models/subSection.model.js";
import Section from "../models/Section.model.js";
import { AsyncHandler } from "../utils/CustomeError/AsyncHandler.js";
import { ApiError } from "../utils/CustomeError/ApiError.js";
import { ApiResponse } from "../utils/CustomeError/ApiResopnse.js";
import { uploadToCloudinary } from "../utils/ImageUploader.js";

// Create SubSection
export const craeteSubSection = AsyncHandler(async (req, res) => {
  // Fetch Data
  const { title, description, timeDuration, sectionId } = req.body;
  const { video } = req.files.vidoName;
  // Validate
  if (!title || !description || !timeDuration || !sectionId)
    throw new ApiError("Please fill all the fields", 400);

  // Upload the video to cloudinary
  const uploadedDeatails = await uploadToCloudinary(
    video,
    process.env.FOLDER_NAME
  );
  // Create SubSection
  const subSection = await SubSection.create({
    title: title,
    description: description,
    timeDuration: timeDuration,
    videoUrl: uploadedDeatails.secure_url,
  });

  // Update the Section
  const Updatedsection = await Section.findByIdAndUpdate(
    sectionId,
    {
      $push: { subSections: subSection._id },
    },
    { new: true }
  );

  // TODO : Log updatedSection here after adding populate query
  // return response
  return res.json(
    new ApiResponse(200, Updatedsection, "SubSection Created Successfully")
  );
});

// Update SubSection
export const updateSubSection = AsyncHandler(async (req, res) => {
  // Fetch Data
  const { SubSectionId } = req.params;
  const { title, description, timeDuration } = req.body;
  const { video } = req.files.vidoName;
  // Validate
  if (!title || !description || !timeDuration)
    throw new ApiError("Please fill all the fields", 400);
  // Fetch SubSection
  const subSection = await SubSection.findById(id);

  if (!subSection) throw new ApiError("SubSection not found", 404);
  // Upload  Video on Clodinary
  if (video) {
    // Upload the video to cloudinary
    const uploadedDeatails = await uploadToCloudinary(
      video,
      process.env.FOLDER_NAME
    );
  }

  //update SubSection
  const updatedSubSection = await SubSection.findByIdAndUpdate(
    SubSectionId,
    {
      title: title,
      description: description,
      timeDuration: timeDuration,
      videoUrl: uploadedDeatails.secure_url,
    },
    { new: true }
  );

  return res.json(
    new ApiResponse(200, updateSubSection, "SubSection Updated Successfully")
  );
});

// Delete Subsection
export const deleteSubSection = AsyncHandler(async (req, res) => {
  const { SubSectionId } = req.params;
  const subSection = await SubSection.findByIdAndRemove(SubSectionId);
  if (!subSection) throw new ApiError("SubSection not found", 404);
  return res.json(
    new ApiResponse(200, null, "SubSection Deleted Successfully")
  );
});
