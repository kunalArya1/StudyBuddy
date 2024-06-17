import { AsyncHandler } from "../utils/CustomeError/AsyncHandler.js";
import { ApiResponse } from "../utils/CustomeError/ApiResopnse.js";
import { ApiError } from "../utils/CustomeError/ApiError.js";
import Course from "../models/Course.model.js";
import User from "../models/User.model.js";
import { uploadToCloudinary } from "../utils/ImageUploader.js";
import Category from "../models/Category.model.js";

// Create Course

export const createCourse = AsyncHandler(async (req, res) => {
  // get Data
  const { courseName, courseDescription, whatYouWillLearn, price, category } =
    req.body;

  // get thumbnail
  const thumbnail = req.files.thumbnailLimage;

  // Validation
  if (
    !courseName ||
    !courseDescription ||
    !whatYouWillLearn ||
    !price ||
    !category
  ) {
    throw new ApiError("All fields are rquired", 400);
  }

  // Check for Instructor
  const instructor = await User.findById(req.user.id);
  console.log(instructor);

  if (!instructor) {
    throw new ApiError("Instructor not found", 404);
  }

  // check given tag is valid or not
  const categoryDetails = await Category.findById(category);

  if (!categoryDetails) {
    throw new ApiError("Category not found", 404);
  }

  // upload image to cloudinary
  const thumbnailImageUplod = await uploadToCloudinary(
    thumbnail,
    process.env.FOLDER_NAME
  );

  // Create an entry for new Course

  const newCourse = await Course.create({
    courseName,
    courseDescription,
    whatYouWillLearn,
    price,
    category: categoryDetails._id,
    thumbnail: thumbnailImageUplod.secure_url,
    instructor: instructor._id,
  });

  // instructor ko update krna , uske course me dal do
  await User.findByIdAndUpdate(
    instructor._id,
    {
      $push: { courses: newCourse._id },
    },
    {
      new: true,
    }
  );

  // update the Category
  await Category.findByIdAndUpdate(
    categoryDetails._id,
    {
      $push: { courses: newCourse._id },
    },
    {
      new: true,
    }
  );

  return res.json(
    new ApiResponse(200, newCourse, "Course Created Successfully")
  );
});

// getAll course
export const getAllCourses = AsyncHandler(async (req, res) => {
  const courses = await Course.find(
    {},
    {
      courseName: true,
      courseDescription: true,
      price: true,
      thumbnail: true,
      instructor: true,
      studetEnrolled: true,
      ratingAndReview: true,
    }
  )
    .populate("category")
    .populate("instructor")
    .exec();

  return res.json(
    new ApiResponse(200, courses, "All Course Details fetched successfully")
  );
});
