import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

// SIGNUP CONTROLLER
export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio
    });



    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: newUser,
      // token
    });

  } catch (error) {
    console.error("Error during signup:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// LOGIN CONTROLLER
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userData = await User.findOne({ email });

    if (!userData) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, userData.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(userData._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: userData,
      token
    });

  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// CHECK IF AUTHENTICATED
export const checkAuth = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "User is authenticated",
    user: req.user
  });
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;
    const userId = req.user._id;

    let updatedUser;

    if (!profilePic || profilePic.length < 50) {

      updatedUser = await User.findByIdAndUpdate(
        userId,
        { bio, fullName },
        { new: true }
      );
    } else {
      console.log("📤 Uploading image to Cloudinary...");

      try {
        const upload = await cloudinary.uploader.upload(profilePic, {
          folder: "profile_pics", // optional
        });

        updatedUser = await User.findByIdAndUpdate(
          userId,
          {
            profilePic: upload.secure_url,
            bio,
            fullName,
          },
          { new: true }
        );
      } catch (uploadError) {
        console.error("❌ Cloudinary upload failed:", uploadError.message);
        return res.status(500).json({
          success: false,
          message: "Image upload failed",
          error: uploadError.message,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    console.error("❌ Error updating profile:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
