import express from "express";
import Patient from "../models/PatientModel.js";
import User from "../models/UserModel.js";
import verifyToken from "../Middlewares/verifyToken.js";
import authorizeRoles from "../Middlewares/roleAuthorization.js";

const router = express.Router();



// CREATE PATIENT PROFILE

router.post(
  "/profile",
  verifyToken,
  authorizeRoles("patient"),
  async (req, res) => {
    try {
      const existingProfile = await Patient.findOne({
        userId: req.user._id,
      });

      if (existingProfile) {
        return res.status(409).json({
          success: false,
          message: "Patient profile already exists",
        });
      }

      const patient = await Patient.create({
        userId: req.user._id,
        ...req.body,
      });

      res.status(201).json({
        success: true,
        message: "Patient profile created successfully",
        patient,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create patient profile",
        error: error.message,
      });
    }
  }
);



// GET OWN PATIENT PROFILE

router.get(
  "/profile",
  verifyToken,
  authorizeRoles("patient"),
  async (req, res) => {
    try {
      const patient = await Patient.findOne({
        userId: req.user._id,
      }).populate("userId", "name email phone");

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient profile not found",
        });
      }

      res.status(200).json({
        success: true,
        patient,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve patient profile",
      });
    }
  }
);



// UPDATE OWN PATIENT PROFILE

router.put(
  "/profile",
  verifyToken,
  authorizeRoles("patient"),
  async (req, res) => {
    try {
      // Prevent changing the user relationship
      delete req.body.userId;

      const patient = await Patient.findOneAndUpdate(
        { userId: req.user._id },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient profile not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Patient profile updated successfully",
        patient,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update patient profile",
        error: error.message,
      });
    }
  }
);



// GET ALL PATIENTS

router.get(
  "/",
  verifyToken,
  authorizeRoles("admin", "receptionist"),
  async (req, res) => {
    try {
      const patients = await Patient.find({ isActive: true })
        .populate("userId", "name email phone")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: patients.length,
        patients,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve patients",
      });
    }
  }
);



// STAFF CREATES PATIENT PROFILE

router.post(
  "/",
  verifyToken,
  authorizeRoles("admin", "receptionist"),
  async (req, res) => {
    try {
      const { userId, ...profileData } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "Patient userId is required",
        });
      }

      const User = (await import("../models/UserModel.js")).default;

      const user = await User.findById(userId);

      if (!user || user.role !== "patient") {
        return res.status(400).json({
          success: false,
          message: "Valid patient user account not found",
        });
      }

      const existingProfile = await Patient.findOne({ userId });

      if (existingProfile) {
        return res.status(409).json({
          success: false,
          message: "Patient profile already exists",
        });
      }

      const patient = await Patient.create({
        userId,
        ...profileData,
      });

      res.status(201).json({
        success: true,
        message: "Patient profile created successfully by staff",
        patient,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create patient profile",
        error: error.message,
      });
    }
  }
);



// GET PATIENT BY PROFILE ID

router.get(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "receptionist", "doctor"),
  async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.id).populate(
        "userId",
        "name email phone"
      );

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient not found",
        });
      }

      res.status(200).json({
        success: true,
        patient,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }
  }
);


export default router;