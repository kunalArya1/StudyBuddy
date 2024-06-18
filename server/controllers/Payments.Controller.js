import { AsyncHandler } from "../utils/CustomeError/AsyncHandler.js";
import { ApiResponse } from "../utils/CustomeError/ApiResopnse.js";
import { ApiError } from "../utils/CustomeError/ApiError.js";
import Course from "../models/Course.model.js";
import User from "../models/User.model.js";
import { instance } from "../Config/razorpay.js";
import mailSender from "../utils/MailSender.js";
import mongoose from "mongoose";

// Caputure the Payment and Initiate Razorpay order

export const CaputurePayment = AsyncHandler(async (req, res) => {
  // get course id and user id
  const { course_id } = req.body;
  const user_id = req.user.id;
  //Validation
  if (!course_id) {
    throw new ApiError("Please provide vaild Course ID", 400);
  }
  //Vaild courseId
  let course;

  try {
    course = await Course.findById(course_id);
    if (!course) {
      throw new ApiError("Course Not Found", 404);
    }
    //User Already paid for the same  course
    const userid = new mongoose.Types.ObjectId(user_id);
    if (course.studetEnrolled.includes(userid)) {
      throw new ApiError("You have already enrolled for this course", 400);
    }
  } catch (error) {
    throw new ApiError("Course Not Found", 404);
  }

  //order Created
  const amount = course.price;
  const currency = "INR";

  const options = {
    amout: amount * 100,
    currency: currency,
    receipt: Math.random(Date.now().toString()),
    notes: {
      courseId: course_id,
      user_id,
    },
  };

  try {
    // initiate the payent
    const paymentResponse = await instance.orders.create(options);
    console.log(paymentResponse);
    return res.json(
      new ApiResponse(
        200,
        {
          courseName: course.courseName,
          courseDescription: course.courseDescription,
          thumbanil: course.thumbnail,
          orderID: paymentResponse.id,
          currency: paymentResponse.currency,
          amount: paymentResponse.amount,
        },
        "Paymet Captured SuccessFully "
      )
    );
  } catch (error) {
    throw new ApiError(401, "Cloudnot Initiate Order");
    console.log(error);
  }
  //return response
});

// verify Signature of Razorpay and Server
export const verifySignature = AsyncHandler(async (req, res) => {
  const webHookSecret = "12345";
  const singature = req.headers["x-razorpay-singature"];

  const shaSum = crypto.createHmac("sha256", webHookSecret);
  shaSum.update(JSON.stringify(req.body));
  const digest = shaSum.digest("hex");

  if (singature === digest) {
    // throw new ApiError(401, "Invalid Signature");
    console.log("Signature is valid");
    const { courseId, user_id } = req.body.payload.payment.entity.notes;

    try {
      // Action
      // Find the course and enroll the user in it
      const enrolledCourse = await Course.findOneAndUpdate(
        courseId,
        {
          $push: { studetEnrolled: user_id },
        },
        {
          new: true,
        }
      );

      if (!enrolledCourse) {
        throw new ApiError(500, "Course Not Found");
      }

      console.log(enrolledCourse);

      // find the student and update course section of it.
      const enrolledStudent = await User.findOneAndUpdate(
        user_id,
        {
          $push: { courses: courseId },
        },
        { new: true }
      );

      console.log(enrolledStudent);
      // mail Send
      const emailResponse = await mailSender(
        enrolledStudent.email,
        "Congratulation you are done a great desicion",
        "Ho gya Bhai jao ab pdh lo "
      );

      console.log(emailResponse);
      return res.json(
        new ApiResponse(200, null, "Signature Verified and Course Added ")
      );
    } catch (error) {
      throw new ApiError(500, "Error While verifying the signature ");
    }
  } else {
    throw new ApiError(400, "Invalid Request!Singature is not Valid");
  }
});
