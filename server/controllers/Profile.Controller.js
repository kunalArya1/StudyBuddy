import Profile from "../models/Profile.model.js";
import User from "../models/User.model.js";
import { AsyncHandler } from "../utils/CustomeError/AsyncHandler.js";
import { ApiError } from "../utils/CustomeError/ApiError.js";
import { ApiResponse } from "../utils/CustomeError/ApiResopnse.js";

//Update Profile
export const UpdateProfile = AsyncHandler(async (req, res) => {
  // fetch Data
  const { gender, dateOfBirth = "", about = "", contactNumber } = req.body;

  const id = req.user.id;
  // TODO : how to schedule a request for some date
  // Validate Data
  if (!contactNumber || !gender || !id) {
    throw new ApiError("Please fill all the fields", 400);
  }
  // find profile and update
  const user = await User.findById(id);
  const profileId = user.additionalDetails;
  const profileDetails = await Profile.findById(profileId);
  profileDetails.dateOfBirth = dateOfBirth;
  profileDetails.gender = gender;
  profileDetails.contactNumber = contactNumber;
  profileDetails.about = about;
  await profileDetails.save();
  // return response
  return res.json(
    new ApiResponse(200, profileDetails, "Profile Updated Successfully")
  );
});

//Delete Account
export const deleteAccount = AsyncHandler(async (req, res) => {
  //fetch Data
  const id = req.user.id;

  // Validate Data
  if (!id) {
    throw new ApiError("User Not Found", 404);
  }

  // Get user Details
  const userDetails = await User.findById(id);

  // Validate user
  if (!userDetails) {
    throw new ApiError(404, "User Not Found ");
  }
  // Delete Profile Details
  const profileId = userDetails.additionalDetails;
  await Profile.findByIdAndDelete(profileId);

  // TODO: unenrolled user from all enrolled courese
  // TODO : CRON JOB

  // Delete User
  const DeletedUser = await User.findByIdAndDelete(id);

  // return response
  return res.json(new ApiResponse(200, null, "Account Deleted Successfully"));
});

//Get User
export const GetUserDetails = AsyncHandler(async (req, res) => {
  const id = req.user.id;
  const user = await User.findById(id).populate("additionalDetails").exec();
  if (!user) {
    throw new ApiError("User Not Found", 404);
  }
  return res.json(
    new ApiResponse(200, user, "User Details Fetched Successfully")
  );
});
