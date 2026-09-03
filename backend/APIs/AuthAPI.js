import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import verifyToken from "../Middlewares/verifyToken.js";

import authorizeRoles from "../Middlewares/roleAuthorization.js";

const router = express.Router();


// PATIENT SELF REGISTRATION

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Create patient only
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: "patient",
    });

    res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
});



// LOGIN

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Explicitly select password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check account status
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "This account has been deactivated",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
});



// GET CURRENT LOGGED-IN USER

router.get("/me", verifyToken, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user information",
    });
  }
});



// STAFF REGISTERS A PATIENT

router.post(
  "/register-patient",
  verifyToken,
  authorizeRoles("receptionist", "admin"),
  async (req, res) => {
    try {
      const { name, email, password, phone } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Name, email and password are required",
        });
      }

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "User already exists with this email",
        });
      }

      const user = await User.create({
        name,
        email,
        password,
        phone,
        role: "patient",
      });

      res.status(201).json({
        success: true,
        message: "Patient registered successfully by staff",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Patient registration failed",
        error: error.message,
      });
    }
  }
);



// ADMIN CREATES STAFF ACCOUNTS

router.post(
  "/create-staff",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { name, email, password, phone, role } = req.body;

      const allowedStaffRoles = [
        "doctor",
        "receptionist",
        "lab_technician",
      ];

      if (!name || !email || !password || !role) {
        return res.status(400).json({
          success: false,
          message: "Name, email, password and role are required",
        });
      }

      if (!allowedStaffRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid staff role. Allowed roles are doctor, receptionist and lab_technician",
        });
      }

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "User already exists with this email",
        });
      }

      const user = await User.create({
        name,
        email,
        password,
        phone,
        role,
      });

      res.status(201).json({
        success: true,
        message: `${role} account created successfully`,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Staff account creation failed",
        error: error.message,
      });
    }
  }
);



export default router;