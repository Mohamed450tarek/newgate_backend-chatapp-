
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import asyncHandler from 'express-async-handler';
import  ApiError from '../utils/apiError.js';
import sendEmail from '../utils/sendmail.js';
 import createToken from '../lib/utils.js';
import User from '../models/User.js';
//import { OAuth2Client } from 'google-auth-library';
import { arefriends, requestExist } from '../utils/checkfrinds.js';
//////////// 
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";
// signup new user 
export const signup = asyncHandler(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  const token = createToken(user._id);
  console.log ("signup user:", user);
  res.status(201).json({ data: user, token });
});
// login 
export const login = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError('Incorrect email or password', 401));
  }
  const token = createToken(user._id);
  delete user._doc.password;
 
  res.status(200).json({ data:  user , token, Success: true }) ; 
});
// protect routs 
export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new ApiError('You are not login, Please login to get access this route', 401));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(new ApiError('The user that belong to this token does no longer exist', 401));
  }
  if (currentUser.passwordChangedAt) {
    const passChangedTimestamp = parseInt(currentUser.passwordChangedAt.getTime() / 1000, 10);
    if (passChangedTimestamp > decoded.iat) {
      return next(new ApiError('User recently changed his password. please login again..', 401));
    }
  }
  req.user = currentUser;
  next();
});
 // roles allow for how // authorization 
export const allowedTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You are not allowed to access this route" });
    }
    next();
  };
};
 // forget my password 
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new ApiError(`There is no user with that email ${req.body.email}`, 404));
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto.createHash('sha256').update(resetCode).digest('hex');
  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;
  await user.save();
  const message = `Hi ${user.name}, We received a request to reset the password on your moka Account. ${resetCode} Enter this code to complete the reset.`;
  try {
    await sendEmail({ email: user.email, subject: 'Your password reset code (valid for 10 min)', message });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;
    await user.save();
    return next(new ApiError('There is an error in sending email', 500));
  }
  res.status(200).json({ status: 'Success', message: 'Reset code sent to email' });
});

// verify reset code
export const verifyPassResetCode = asyncHandler(async (req, res, next) => {
  const hashedResetCode = crypto.createHash('sha256').update(req.body.resetCode).digest('hex');
  const user = await User.findOne({ passwordResetCode: hashedResetCode, passwordResetExpires: { $gt: Date.now() } });
  if (!user) return next(new ApiError('Reset code invalid or expired'));
  user.passwordResetVerified = true;
  await user.save();
  res.status(200).json({ status: 'Success' });
});

// reaset password 
export const resetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new ApiError(`There is no user with email ${req.body.email}`, 404));
  if (!user.passwordResetVerified) return next(new ApiError('Reset code not verified', 400));
  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;
  await user.save();
  const token = createToken(user._id);
  res.status(200).json({ token });
});

/*const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// google login 
export const googleLogin = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;
  if (!idToken) return next(new ApiError("No Google ID Token provided", 400));
  const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
  const payload = ticket.getPayload();
  const { email, name, picture } = payload;
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ name, email, password: null, profileImg: picture, provider: "google" });
  }
  const token = createToken(user._id);
  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" });
  if (user._doc.password) delete user._doc.password;
  res.status(200).json({ data: user, token, refreshToken, Success: true });
});

// send friend request
*/
export const sendfrindrequest = asyncHandler(async (req, res, next) => {
  const { friendId } = req.params;
  const user = req.user;
  if (!friendId) return next(new ApiError("Friend ID is required", 400));
  const friend = await User.findById(friendId);
  if (!friend) return next(new ApiError("Invalid friend ID", 400));
  if (arefriends(user, friend) || requestExist(user, friend)) return next(new ApiError("Cannot send request", 400));
  friend.friendRequests = friend.friendRequests || [];
  if (!friend.friendRequests.includes(user._id)) friend.friendRequests.push(user._id);
  await friend.save();
  return res.json({ success: true, message: "Friend request sent successfully!"    });
});


// accept frind request 
export const acceptfrindrequest = asyncHandler(async (req, res, next) => {
  const { friendId } = req.params;
  const user = req.user;
  if (!friendId) return next(new ApiError("Friend ID is required", 400));
  const friend = await User.findById(friendId);
  if (!friend) return next(new ApiError("Invalid friend ID", 400));
  if (arefriends(user, friend)) return next(new ApiError("You are already friends", 400));
  user.friends = user.friends || [];
  friend.friends = friend.friends || [];
  if (!user.friends.includes(friend._id)) user.friends.push(friend._id);
  if (!friend.friends.includes(user._id)) friend.friends.push(user._id);
  user.friendRequests = (user.friendRequests || []).map(String).filter((id) => id !== String(friend._id));
  await user.save();
  await friend.save();
  return res.json({ success: true, message: "Friend request accepted!" });
});


 // edit profile picture 

export const  profilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const user = await User.findById(req.user._id);

 // 

    if (user.profilePic?.public_id) {
      await cloudinary.uploader.destroy(user.profilePic.public_id);
    }

    // upload new image 
    const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
      folder: `users/${req.user._id}/profilepicture`,
      quality: "auto",
      fetch_format: "auto",
      transformation: [{ width: 500, height: 500, crop: "limit" }],
    });

  
    user.profilePic = {
      secure_url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
    };
    await user.save();

     // some edit on json 
    const userSafe = user.toObject();
    delete userSafe.password;
    delete userSafe.__v;

    const token = createToken(user._id);

return res.json({
  success: true,
  result: { ...userSafe, token },
});


  
    
  } catch (error) {
    console.error("Error updating profile picture:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
