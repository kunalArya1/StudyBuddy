import { AsyncHandler } from "../utils/CustomeError/AsyncHandler.js";
import { ApiResponse } from "../utils/CustomeError/ApiResopnse.js";
import { ApiError } from "../utils/CustomeError/ApiError.js";
import Course from "../models/Course.model.js";
import RatingAndReview from "../models/RatingAndReview.model.js";
import { uploadToCloudinary } from "../utils/ImageUploader.js";
import mongoose from "mongoose";

// create rating
export const createRating = AsyncHandler(async (req, res) => {
  //get data
  const { courseId, rating, review } = req.body;
  // get user id
  const userId = req.user.id;
  // Validation
  if (!courseId || !rating || !review) {
    throw new ApiError("Please provide all required fields", 400);
  }
  // check if user in enrolled in the ocurse or not

  const course = await Course.findById({
    _id: courseId,
    studetEnrolled: { $eleMatch: { $eq: userId } },
  });
  if (!course) {
    throw new ApiError("Student is not enrolled in the course", 404);
  }

  // check if user have already written the review and rating

  const alreadyReviewd = await RatingAndReview.findOne({
    user: userId,
    course: courseId,
  });
  if (alreadyReviewd) {
    throw new ApiError("You have already reviewed this course", 403);
  }
  // create review
  const givenRstingAndReview = await RatingAndReview.create({
    rating: rating,
    review: review,
    course: courseId,
    user: userId,
  });

  // update the course with rating and review
  const updateCourseDetails = await Course.findByIdAndUpdate(
    courseId,
    {
      $push: { ratings: givenRstingAndReview._id },
    },
    {
      new: true,
    }
  );
  console.log(updateCourseDetails);
  // return response
  return res.json(
    new ApiResponse(
      200,
      givenRstingAndReview,
      "Rating and Review Added Successfully"
    )
  );
});

// Average rating
export const getAverageRating = AsyncHandler(async (req, res) => {
  // get course id
  const { courseId } = req.body.courseId;

  // calculate average rating
  const AverageRating = await Course.aggregate([
    {
      $match: { course: new mongoose.Types.ObjectId(courseId) },
    },
    {
      $group: { _id: null, averageRating: { $avg: "rating" } },
    },
  ]);

  if (AverageRating > 0) {
    return res.json(
      new ApiResponse(
        200,
        { AverageRating: AverageRating[0].averageRating },
        "Average Rating Retrieved Successfully"
      )
    );
  }
  // return rating
  return res.json(
    new ApiResponse(
      200,
      { AverageRating: 0 },
      "Average Raitng is 0, no rating given yet"
    )
  );
});

// getall rating
export const getAllRatingAndReviews = AsyncHandler(async (req, res) => {
  const AllRatingAndReview = await RatingAndReview.find()
    .sort({ rating: "desc" })
    .populate({
      path: "user",
      select: " firstName lastName email image",
    })
    .populate({
      path: "course",
      select: "courseName",
    })
    .exec();

  return res.json(
    new ApiResponse(
      200,
      AllRatingAndReview,
      "All Rating Review fetched successfully"
    )
  );
});

// get ratingandReview associated with the particular course
