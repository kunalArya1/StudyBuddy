import User from "../models/User";
import mailSender from "../utils/MailSender";
import { AsyncHandler } from "../utils/CustomeError/AsyncHandler";
import { ApiResponse } from "../utils/CustomeError/ApiResopnse";
import { ApiError } from "../utils/CustomeError/ApiError";

// reset Password Token
export const resetPasswordToken = AsyncHandler(async (req, res) => {
  // get email from req.body
  const { email } = req.body;

  //check user for this email ,email verification
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // generate token
  const token = crypto.randomUUID();

  //update user by adding the token and expiration time
  user.token = token;
  user.resetPasswordExpires = Date.now() + 5 * 60 * 1000; //5 Min
  await user.save();

  // Link Creation
  const url = `https://localhost:3000/update-passwrod/${token}`;

  // send email containing the url
  await mailSender(
    email,
    "Reset Password Link From Kunal",
    `Password reset Link ${url}`
  );

  // return response
  return new ApiResponse(
    200,
    {},
    "Reset password link sent to your email! Check and change your Password"
  );
});

//  reset Password
export const resetPassword = AsyncHandler(async (req, res) => {
  // get data like token , password from req
  const { password, confirmPassword, token } = req.body;

  // validation
  if (password !== confirmPassword) {
    throw new ApiError("Password and Confirm Password do not match", 400);
  }

  //get user details from db using token
  const user = await User.findOne({ token: token });

  // if entry not - Invalid Token
  if (!user) {
    throw new ApiError("Invalid Token", 400);
  }
  // check token expires time
  if (user.resetPasswordExpires < Date.now()) {
    throw new ApiError("Token Expired", 400);
  }

  // hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // update the password
  const updateduser = await User.findOneAndUpdate(
    { token: token },
    {
      password: hashedPassword,
    },
    {
      new: true,
    }
  );
  user.password = hashedPassword;
  user.save();

  // return response
  return res.json(new ApiResponse(200, user, "Password updated Susscefully"));
});
