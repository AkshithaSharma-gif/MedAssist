import express from "express";
import Doctor from "../models/DoctorModel.js";
import User from "../models/UserModel.js";
import Department from "../models/DepartmentModel.js";
import verifyToken from "../Middlewares/verifyToken.js";
import authorizeRoles from "../Middlewares/roleAuthorization.js";

const router = express.Router();


// ADMIN CREATES DOCTOR PROFILE

router.post(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const {
        userId,
        departmentId,
        specialization,
        qualification,
        experience,
        consultationFee,
        availability,
      } = req.body;

      if (!userId || !departmentId || !specialization) {
        return res.status(400).json({
          success: false,
          message:
            "userId, departmentId and specialization are required",
        });
      }

      // Check whether user exists and is a doctor
      const user = await User.findById(userId);

      if (!user || user.role !== "doctor") {
        return res.status(400).json({
          success: false,
          message: "Valid doctor user account not found",
        });
      }

      // Check whether doctor profile already exists
      const existingDoctor = await Doctor.findOne({ userId });

      if (existingDoctor) {
        return res.status(409).json({
          success: false,
          message: "Doctor profile already exists",
        });
      }

      // Check department
      const department = await Department.findOne({
        _id: departmentId,
        isActive: true,
      });

      if (!department) {
        return res.status(400).json({
          success: false,
          message: "Valid active department not found",
        });
      }

      const doctor = await Doctor.create({
        userId,
        departmentId,
        specialization,
        qualification,
        experience,
        consultationFee,
        availability,
      });

      res.status(201).json({
        success: true,
        message: "Doctor profile created successfully",
        doctor,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create doctor profile",
        error: error.message,
      });
    }
  }
);



// GET ALL ACTIVE DOCTORS

router.get(
  "/",
  verifyToken,
  async (req, res) => {
    try {
      const doctors = await Doctor.find({
        isActive: true,
      })
        .populate("userId", "name email phone")
        .populate("departmentId", "name description")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: doctors.length,
        doctors,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve doctors",
      });
    }
  }
);



// DOCTOR GETS OWN PROFILE

router.get(
  "/profile",
  verifyToken,
  authorizeRoles("doctor"),
  async (req, res) => {
    try {
      const doctor = await Doctor.findOne({
        userId: req.user._id,
      })
        .populate("userId", "name email phone")
        .populate("departmentId", "name description");

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found",
        });
      }

      res.status(200).json({
        success: true,
        doctor,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve doctor profile",
      });
    }
  }
);



// DOCTOR UPDATES OWN PROFILE

router.put(
  "/profile",
  verifyToken,
  authorizeRoles("doctor"),
  async (req, res) => {
    try {
      const allowedUpdates = [
        "specialization",
        "qualification",
        "experience",
        "consultationFee",
        "availability",
      ];

      const updates = {};

      allowedUpdates.forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      const doctor = await Doctor.findOneAndUpdate(
        { userId: req.user._id },
        updates,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Doctor profile updated successfully",
        doctor,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update doctor profile",
        error: error.message,
      });
    }
  }
);




// GET DOCTOR BY PROFILE ID

router.get(
  "/:id",
  verifyToken,
  async (req, res) => {
    try {
      const doctor = await Doctor.findById(req.params.id)
        .populate("userId", "name email phone")
        .populate("departmentId", "name description");

      if (!doctor || !doctor.isActive) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }

      res.status(200).json({
        success: true,
        doctor,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Invalid doctor ID",
      });
    }
  }
);




// ADMIN UPDATES DOCTOR

router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      // Prevent changing User relationship
      delete req.body.userId;

      // Validate department if changing it
      if (req.body.departmentId) {
        const department = await Department.findOne({
          _id: req.body.departmentId,
          isActive: true,
        });

        if (!department) {
          return res.status(400).json({
            success: false,
            message: "Valid active department not found",
          });
        }
      }

      const doctor = await Doctor.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Doctor updated successfully",
        doctor,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update doctor",
        error: error.message,
      });
    }
  }
);



// ADMIN DEACTIVATES DOCTOR

router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const doctor = await Doctor.findById(req.params.id);

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }

      doctor.isActive = false;
      await doctor.save();

      res.status(200).json({
        success: true,
        message: "Doctor deactivated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to deactivate doctor",
      });
    }
  }
);

export default router;