import express from "express";
import MedicalRecord from "../models/MedicalRecordModel.js";
import Appointment from "../models/AppointmentModel.js";
import Patient from "../models/PatientModel.js";
import Doctor from "../models/DoctorModel.js";
import verifyToken from "../Middlewares/verifyToken.js";
import authorizeRoles from "../Middlewares/roleAuthorization.js";

const router = express.Router();

// ===============================
// CREATE MEDICAL RECORD
// DOCTOR ONLY
// ===============================
router.post(
  "/",
  verifyToken,
  authorizeRoles("doctor"),
  async (req, res) => {
    try {
      const {
        appointmentId,
        symptoms,
        diagnosis,
        treatmentNotes,
        prescription,
        followUpDate,
      } = req.body;

      if (!appointmentId || !diagnosis) {
        return res.status(400).json({
          success: false,
          message: "appointmentId and diagnosis are required",
        });
      }

      // Get doctor's profile
      const doctor = await Doctor.findOne({
        userId: req.user._id,
        isActive: true,
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found",
        });
      }

      // Find appointment
      const appointment = await Appointment.findById(
        appointmentId
      );

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found",
        });
      }

      // Doctor must own this appointment
      if (
        appointment.doctorId.toString() !==
        doctor._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only create records for your own appointments",
        });
      }

      // Appointment must be completed
      if (appointment.status !== "completed") {
        return res.status(400).json({
          success: false,
          message:
            "Medical records can only be created for completed appointments",
        });
      }

      // Prevent duplicate medical record
      const existingRecord = await MedicalRecord.findOne({
        appointmentId,
      });

      if (existingRecord) {
        return res.status(409).json({
          success: false,
          message:
            "Medical record already exists for this appointment",
        });
      }

      // Create medical record
      const medicalRecord = await MedicalRecord.create({
        patientId: appointment.patientId,
        doctorId: doctor._id,
        appointmentId,
        symptoms,
        diagnosis,
        treatmentNotes,
        prescription,
        followUpDate,
      });

      res.status(201).json({
        success: true,
        message: "Medical record created successfully",
        medicalRecord,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create medical record",
        error: error.message,
      });
    }
  }
);


// ===============================
// GET PATIENT'S OWN MEDICAL RECORDS
// ===============================
router.get(
  "/my-records",
  verifyToken,
  authorizeRoles("patient"),
  async (req, res) => {
    try {
      const patient = await Patient.findOne({
        userId: req.user._id,
        isActive: true,
      });

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient profile not found",
        });
      }

      const records = await MedicalRecord.find({
        patientId: patient._id,
      })
        .populate({
          path: "doctorId",
          populate: {
            path: "userId",
            select: "name email phone",
          },
        })
        .populate("appointmentId", "appointmentDate startTime endTime")
        .sort({
          createdAt: -1,
        });

      res.status(200).json({
        success: true,
        count: records.length,
        records,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve medical records",
        error: error.message,
      });
    }
  }
);


// ===============================
// GET DOCTOR'S MEDICAL RECORDS
// ===============================
router.get(
  "/doctor-records",
  verifyToken,
  authorizeRoles("doctor"),
  async (req, res) => {
    try {
      const doctor = await Doctor.findOne({
        userId: req.user._id,
        isActive: true,
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found",
        });
      }

      const records = await MedicalRecord.find({
        doctorId: doctor._id,
      })
        .populate({
          path: "patientId",
          populate: {
            path: "userId",
            select: "name email phone",
          },
        })
        .populate(
          "appointmentId",
          "appointmentDate startTime endTime"
        )
        .sort({
          createdAt: -1,
        });

      res.status(200).json({
        success: true,
        count: records.length,
        records,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve medical records",
        error: error.message,
      });
    }
  }
);



// ===============================
// GET ALL MEDICAL RECORDS
// ADMIN ONLY
// ===============================
router.get(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const records = await MedicalRecord.find()
        .populate({
          path: "patientId",
          populate: {
            path: "userId",
            select: "name email phone",
          },
        })
        .populate({
          path: "doctorId",
          populate: {
            path: "userId",
            select: "name email phone",
          },
        })
        .populate(
          "appointmentId",
          "appointmentDate startTime endTime status"
        )
        .sort({
          createdAt: -1,
        });

      res.status(200).json({
        success: true,
        count: records.length,
        records,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve medical records",
        error: error.message,
      });
    }
  }
);


// ===============================
// GET MEDICAL RECORD BY ID
// ===============================
router.get(
  "/:id",
  verifyToken,
  async (req, res) => {
    try {
      const record = await MedicalRecord.findById(req.params.id)
        .populate({
          path: "patientId",
          populate: {
            path: "userId",
            select: "name email phone",
          },
        })
        .populate({
          path: "doctorId",
          populate: {
            path: "userId",
            select: "name email phone",
          },
        })
        .populate(
          "appointmentId",
          "appointmentDate startTime endTime"
        );

      if (!record) {
        return res.status(404).json({
          success: false,
          message: "Medical record not found",
        });
      }

      // Admin can view all
      if (req.user.role === "admin") {
        return res.status(200).json({
          success: true,
          record,
        });
      }

      // Patient can view only own records
      if (req.user.role === "patient") {
        const patient = await Patient.findOne({
          userId: req.user._id,
        });

        if (
          !patient ||
          record.patientId._id.toString() !== patient._id.toString()
        ) {
          return res.status(403).json({
            success: false,
            message: "Access denied",
          });
        }
      }

      // Doctor can view only records they created
      else if (req.user.role === "doctor") {
        const doctor = await Doctor.findOne({
          userId: req.user._id,
        });

        if (
          !doctor ||
          record.doctorId._id.toString() !== doctor._id.toString()
        ) {
          return res.status(403).json({
            success: false,
            message: "Access denied",
          });
        }
      }

      // Receptionist has no access
      else {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      res.status(200).json({
        success: true,
        record,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Invalid medical record ID",
      });
    }
  }
);


export default router;