import Section from "../models/Section.model.js";
import Course from "../models/Course.model.js";
import { AsyncHandler } from "../utils/CustomeError/AsyncHandler.js";
import { ApiError } from "../utils/CustomeError/ApiError.js";
import { ApiResponse } from "../utils/CustomeError/ApiResopnse.js";

// Create Section
export const createSection = AsyncHandler(async (req, res) => {
  //data Fetch
  const { sectionName, courseId } = req.body;
  //data Validation
  if (!sectionName || !courseId) {
    throw new ApiError("All fields are required", 400);
  }
  //create section
  const newSection = await Section.create({ sectionName });
  // update course with section object id
  const updatedCourse = await Course.findByIdAndUpdate(
    { courseId },
    {
      $push: { courseContent: newSection._id },
    },
    {
      new: true,
    }
  );

  // TODO : how to use populate to populate section and subsection in updatedcourse

  // retuen res
  return res.json(
    new ApiResponse(200, updatedCourse, "Section Created Successfully")
  );
});

// Controller: Update Section
export const updateSection = AsyncHandler(async (req, res) => {
  //data Fetch
  const { sectionName, sectionId } = req.body;

  //Data Validation
  if (!sectionName || !sectionId) {
    throw new ApiError("All fields are required", 400);
  }

  //Update the Data
  const updatedSection = await Section.findByIdAndUpdate(
    sectionId,
    { sectionName },
    { new: true }
  );

  //rerturn response
  return res.json(
    new ApiResponse(200, updatedSection, "Section Updated Successfully")
  );
});

//Delete Section
export const deleteSection = AsyncHandler(async (req, res) => {
  const { sectionId } = req.params;
  //Data Validation
  if (!sectionId) {
    throw new ApiError("Section Id is required", 400);
  }
  //Delete the Data
  await Section.findByIdAndRemove(sectionId);
  //return response'
  return res.json(new ApiResponse(200, null, "Section Deleted Successfully"));
});
