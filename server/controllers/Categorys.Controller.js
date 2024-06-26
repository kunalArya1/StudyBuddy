import { AsyncHandler } from "../utils/CustomeError/AsyncHandler.js";
import { ApiResponse } from "../utils/CustomeError/ApiResopnse.js";
import { ApiError } from "../utils/CustomeError/ApiError.js";
import Category from "../models/Category.model.js";

// Create Category
export const createCategory = AsyncHandler(async (req, res) => {
  // get data
  const { name, description } = req.body;
  // Validation
  if (!name || !description) {
    throw new ApiError("Please fill all the fields", 400);
  }
  // Create Category in db
  const categoryDetails = await Category.create({
    name: name,
    description: description,
  });

  console.log(categoryDetails);

  // Response
  return res.json(new ApiResponse(200, {}, "Category Created Susscefully"));
});

// get All Categorys
export const getAllCategory = AsyncHandler(async (req, res) => {
  const AllCategory = await Category.find(
    {},
    { name: true, description: true }
  );
  return res.json(
    new ApiResponse(200, AllCategory, "All Categorys returened Successfully")
  );
});

// getCategory
export const CategoryPageDetails = AsyncHandler(async (req, res) => {
  // get category id
  const { categoyId } = req.body;

  // get course for specified category id
  const selectedCourse = await Category.findById(categoyId)
    .populate("course")
    .exec();
  // Validation
  if (!selectedCourse) {
    throw new ApiError("Category Not Found", 404);
  }

  // get course of diffn courses
  const differentCategory = await Category.findById({
    _id: { $ne: categoyId },
  })
    .populate("course")
    .exec();

  // TODO: get top selling courses

  // rerturn response
  return res.json(
    new ApiResponse(
      200,
      { selectedCourse, differentCategory },
      "Category Page Course Details Fetched Successfuly"
    )
  );
});
