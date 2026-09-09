import express from "express";

import Patient from "../models/PatientModel.js";
import Doctor from "../models/DoctorModel.js";
import Appointment from "../models/AppointmentModel.js";
import MedicalRecord from "../models/MedicalRecordModel.js";
import Invoice from "../models/InvoiceModel.js";
import mongoose from "mongoose";
import verifyToken from "../Middlewares/verifyToken.js";

const router = express.Router();

// =====================================
// GET ROLE-BASED DASHBOARD
// =====================================
router.get("/", verifyToken, async (req, res) => {
  try {
    const { role, _id } = req.user;

    return res.status(200).json({
      success: true,
      message: "Dashboard route working",
      role,
      userId: _id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
      error: error.message,
    });
  }
});



// =====================================
// GET ADMIN DASHBOARD
// =====================================
router.get("/admin", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const today = new Date();

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const [
      totalPatients,
      totalDoctors,
      totalDepartments,
      totalServices,
      totalAppointments,
      todayAppointments,
      scheduledAppointments,
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments,
      revenueData,
      pendingRevenueData,
    ] = await Promise.all([
      Patient.countDocuments({ isActive: true }),

      Doctor.countDocuments({ isActive: true }),

      // Department model
      mongoose.model("Department").countDocuments(),

      // Service model
      mongoose.model("Service").countDocuments(),

      Appointment.countDocuments(),

      Appointment.countDocuments({
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      }),

      Appointment.countDocuments({
        status: "scheduled",
      }),

      Appointment.countDocuments({
        status: "confirmed",
      }),

      Appointment.countDocuments({
        status: "completed",
      }),

      Appointment.countDocuments({
        status: "cancelled",
      }),

      Invoice.aggregate([
        {
          $match: {
            paymentStatus: "paid",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),

      Invoice.aggregate([
        {
          $match: {
            paymentStatus: "pending",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    const totalRevenue =
      revenueData.length > 0
        ? revenueData[0].total
        : 0;

    const pendingRevenue =
      pendingRevenueData.length > 0
        ? pendingRevenueData[0].total
        : 0;

    res.status(200).json({
      success: true,

      dashboard: {
        users: {
          totalPatients,
          totalDoctors,
        },

        resources: {
          totalDepartments,
          totalServices,
        },

        appointments: {
          total: totalAppointments,
          today: todayAppointments,

          status: {
            scheduled: scheduledAppointments,
            confirmed: confirmedAppointments,
            completed: completedAppointments,
            cancelled: cancelledAppointments,
          },
        },

        revenue: {
          totalRevenue,
          pendingRevenue,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard",
      error: error.message,
    });
  }
});



//doctor dashboard

router.get("/doctor", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Doctor only.",
      });
    }

    const doctor = await Doctor.findOne({ userId: req.user._id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      todayAppointments,
      scheduledAppointments,
      confirmedAppointments,
      completedAppointments,
    ] = await Promise.all([
      Appointment.countDocuments({
        doctorId: doctor._id,
        appointmentDate: {
          $gte: today,
          $lt: tomorrow,
        },
      }),

      Appointment.countDocuments({
        doctorId: doctor._id,
        status: "scheduled",
      }),

      Appointment.countDocuments({
        doctorId: doctor._id,
        status: "confirmed",
      }),

      Appointment.countDocuments({
        doctorId: doctor._id,
        status: "completed",
      }),
    ]);

    return res.status(200).json({
      success: true,
      dashboard: {
        todayAppointments,
        scheduledAppointments,
        confirmedAppointments,
        completedAppointments,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load doctor dashboard",
      error: error.message,
    });
  }
});


//patient dashboard


router.get("/patient", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Patient only.",
      });
    }

    const patient = await Patient.findOne({ userId: req.user._id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    const [
      upcomingAppointments,
      completedAppointments,
      medicalRecords,
      pendingInvoices,
    ] = await Promise.all([
      Appointment.countDocuments({
        patientId: patient._id,
        appointmentDate: { $gte: new Date() },
        status: { $in: ["scheduled", "confirmed"] },
      }),

      Appointment.countDocuments({
        patientId: patient._id,
        status: "completed",
      }),

      MedicalRecord.countDocuments({
        patientId: patient._id,
      }),

      Invoice.countDocuments({
        patientId: patient._id,
        paymentStatus: "pending",
      }),
    ]);

    return res.status(200).json({
      success: true,
      dashboard: {
        upcomingAppointments,
        completedAppointments,
        medicalRecords,
        pendingInvoices,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load patient dashboard",
      error: error.message,
    });
  }
});


//receptionist dashboard

router.get("/receptionist", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "receptionist") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Receptionist only.",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      todayAppointments,
      scheduledAppointments,
      confirmedAppointments,
      pendingInvoices,
    ] = await Promise.all([
      Appointment.countDocuments({
        appointmentDate: {
          $gte: today,
          $lt: tomorrow,
        },
      }),

      Appointment.countDocuments({
        status: "scheduled",
      }),

      Appointment.countDocuments({
        status: "confirmed",
      }),

      Invoice.countDocuments({
        paymentStatus: "pending",
      }),
    ]);

    return res.status(200).json({
      success: true,
      dashboard: {
        todayAppointments,
        scheduledAppointments,
        confirmedAppointments,
        pendingInvoices,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load receptionist dashboard",
      error: error.message,
    });
  }
});



export default router;