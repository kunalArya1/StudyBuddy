import { ApiError } from "../utils/CustomeError/ApiError";
import { ApiResponse } from "../utils/CustomeError/ApiResopnse";
import { AsyncHandler } from "../utils/CustomeError/AsyncHandler";
import User from "../models/User";
import Otp from "../models/Otp";
import otpGenerator from "otp-generator";
import bcrypt from "bcrypt";
import Profile from "../models/Profile";
import jwt from "jsonwebtoken";
import mailSender from "../utils/MailSender";
// sendOTP

export const sendOtp = AsyncHandler(async (req, res, next) => {
  // get Email
  const { email } = req.body;
  //check user already exist

  const userExist = await User.findOne({ email });
  // user Already Exist
  if (userExist) {
    throw new ApiError(401, "User Already Registred");
  }
  // otp generation
  var otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  // otp unique
  const result = await Otp.findOne({ otp: otp });

  while (result) {
    otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    result = await Otp.findOne({ otp: otp });
  }

  const otpPayload = {
    email,
    otp,
  };
  // store otp in db

  const otpBody = await Otp.create(otpPayload);

  res.json(new ApiResponse(200, otp, "OTP Sent SuccessFully"));
});

// SignUp

export const SignUp = AsyncHandler(async (req, res, next) => {
  // get details

  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    accountType,
    contactNumber,
    otp,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !confirmPassword ||
    !contactNumber ||
    !otp
  ) {
    throw new ApiError(403, "All fileds are Required");
  }

  // Match Both Password

  if (password !== confirmPassword) {
    throw new ApiError(
      400,
      "Password and Confirm Password Value does not Match"
    );
  }

  // check user already registred
  const alreadyExist = await User.findOne({ email });

  if (alreadyExist) {
    throw new ApiError(403, "User Already Registred");
  }

  // find most recent otp

  const recentOtp = await Otp.find({ email }).sort({ createdAt: -1 }).limit(1);
  // Validate otp

  if (recentOtp.length == 0) {
    throw new ApiError(400, "OTP is not Found!");
  } else if (otp !== recentOtp) {
    throw new ApiError(400, "Invalid OTP");
  }
  // hash Password

  const hashedPassword = bcrypt.hash(password, 10);
  // user Profile
  const profile = await Profile.create({
    gender: null,
    dateOfBirth: null,
    about: null,
    contactNumber: null,
  });

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    contactNumber,
    accountType,
    password: hashedPassword,
    additionalDetails: profile._id,
    image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
  });

  // Send Response

  res.json(new ApiResponse(200, user, "User Registred Susscefully"));
});

// SignIn
export const SignIn = AsyncHandler(async (req, res, next) => {
  // get Details from body
  const { email, password } = req.body;

  // Validate data
  if (!email || !password) {
    throw new ApiError(403, "All fileds are required");
  }

  // Check user is Valid or not

  const user = await User.findOne({ email }).populate("addtionalDetails");

  if (!user) {
    throw new ApiError(401, "User is not registred with this emial");
  }

  // Validate password
  if (await bcrypt.compare(password, user.password)) {
    const payload = {
      email: user.email,
      id: user.id,
      accountType: user.accountType,
    };
    const token = jwt.sign(payload, process.env.JWT_SCRET, { expiresIn: "2h" });

    user.token = token;
    user.password = undefined;

    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };
    res
      .cookie("token", token, options)
      .json(
        new ApiResponse(200, { token, user }, "User loged In Successfully")
      );
  } else {
    res.json(new ApiResponse(401, "Password is Incorrect"));
  }
});

// ChangePassword

export const changePassword = AsyncHandler(async (req, res, next) => {
  //get data from body
  const { email, oldPassword, newPassword, confirmPassword } = req.body;

  //get old password ,new password confirmpasswpord
  if (!email || !oldPassword || !newPassword || !confirmPassword) {
    throw new ApiError(403, "All fields are required");
  }

  //validation
  if (newPassword !== confirmPassword) {
    throw new ApiError(403, "Password and Confirm Password does not match");
  }

  // get user
  const user = await User.findOne({ email: email });

  // update password in db
  if (await bcrypt.compare(oldPassword, user.password)) {
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
  } else {
    throw new ApiError(403, "Old Password is Incorrect");
  }

  // send maill - password updated
  await mailSender(
    email,
    "Your Password has Changed",
    "Your Passowrd Changed.Please Check and Verify!"
  );
  // return response
  res.json(new ApiResponse(200, {}, "Password Updated Successfully"));
});
