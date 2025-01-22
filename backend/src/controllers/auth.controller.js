import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import uploadOnCloudinary from "../lib/cloudinary.js"

const getPublicIdFromUrl = (url) => {
  // Match the pattern in the Cloudinary URL and extract the public ID
  const match = url.match(/\/([^/]+)\.([a-zA-Z0-9]{3,4})$/);
  if (match && match[1]) {
    return match[1]; // Return the public ID
  }
  return null; // Return null if URL does not match the expected format
};

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // generate jwt token here
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  console.log("File received:", req.file); // Logs the file details
  try {
    const avatarLocalPath = await req.file?.path;
    if (!avatarLocalPath) {
      return res.status(400).json({ message: "Avatar file is missing" });
    }
    const oldUrl = req.user.profilePic?.url;

    if(oldUrl){
      const publicId = getPublicIdFromUrl(oldUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }
    console.log("Upload the new avatar to Cloudinary")
    console.log(avatarLocalPath)
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log("avatar has returned:",avatar);
    if (!avatar.url) {
      return res.status(400).json({ message: "Error while uploading avatar" });
    }

    // Update the user's avatar URL in the database
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          profilePic: avatar.url,
        },
      },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      status: 200,
      data: user,
      message: "Avatar image updated successfully",
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};