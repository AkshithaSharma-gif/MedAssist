import express from "express";
import Invoice from "../models/InvoiceModel.js";
import Appointment from "../models/AppointmentModel.js";
import Patient from "../models/PatientModel.js";
import Service from "../models/ServiceModel.js";
import verifyToken from "../Middlewares/verifyToken.js";
import authorizeRoles from "../Middlewares/roleAuthorization.js";

const router = express.Router();

// ===============================
// CREATE INVOICE
// ADMIN / RECEPTIONIST
// ===============================
router.post(
  "/",
  verifyToken,
  authorizeRoles("admin", "receptionist"),
  async (req, res) => {
    try {
      const { appointmentId } = req.body;

      if (!appointmentId) {
        return res.status(400).json({
          success: false,
          message: "appointmentId is required",
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

      // Prevent duplicate invoices
      const existingInvoice = await Invoice.findOne({
        appointmentId,
      });

      if (existingInvoice) {
        return res.status(409).json({
          success: false,
          message:
            "Invoice already exists for this appointment",
        });
      }

      // Get service from appointment
      const service = await Service.findById(
        appointment.serviceId
      );

      if (!service) {
        return res.status(404).json({
          success: false,
          message: "Service associated with appointment not found",
        });
      }

      // Validate patient
      const patient = await Patient.findById(
        appointment.patientId
      );

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient associated with appointment not found",
        });
      }

      // Create invoice
      const invoice = await Invoice.create({
        patientId: appointment.patientId,
        appointmentId: appointment._id,
        serviceId: appointment.serviceId,
        amount: service.price,
        paymentStatus: "pending",
      });

      res.status(201).json({
        success: true,
        message: "Invoice created successfully",
        invoice,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create invoice",
        error: error.message,
      });
    }
  }
);


// ===============================
// GET PATIENT'S OWN INVOICES
// ===============================
router.get(
  "/my-invoices",
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

      const invoices = await Invoice.find({
        patientId: patient._id,
      })
        .populate(
          "appointmentId",
          "appointmentDate startTime endTime status"
        )
        .populate(
          "serviceId",
          "name description price duration"
        )
        .sort({
          createdAt: -1,
        });

      res.status(200).json({
        success: true,
        count: invoices.length,
        invoices,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve invoices",
        error: error.message,
      });
    }
  }
);

// ===============================
// GET ALL INVOICES
// ADMIN / RECEPTIONIST
// ===============================
router.get(
  "/",
  verifyToken,
  authorizeRoles("admin", "receptionist"),
  async (req, res) => {
    try {
      const invoices = await Invoice.find()
        .populate({
          path: "patientId",
          populate: {
            path: "userId",
            select: "name email phone",
          },
        })
        .populate(
          "appointmentId",
          "appointmentDate startTime endTime status"
        )
        .populate(
          "serviceId",
          "name description price duration"
        )
        .sort({
          createdAt: -1,
        });

      res.status(200).json({
        success: true,
        count: invoices.length,
        invoices,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve invoices",
        error: error.message,
      });
    }
  }
);


// ===============================
// GET INVOICE BY ID
// ===============================
router.get(
  "/:id",
  verifyToken,
  async (req, res) => {
    try {
      const invoice = await Invoice.findById(req.params.id)
        .populate({
          path: "patientId",
          populate: {
            path: "userId",
            select: "name email phone",
          },
        })
        .populate(
          "appointmentId",
          "appointmentDate startTime endTime status"
        )
        .populate(
          "serviceId",
          "name description price duration"
        );

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found",
        });
      }

      // Admin / Receptionist can view all
      if (
        req.user.role === "admin" ||
        req.user.role === "receptionist"
      ) {
        return res.status(200).json({
          success: true,
          invoice,
        });
      }

      // Patient can only view their own invoice
      if (req.user.role === "patient") {
        const patient = await Patient.findOne({
          userId: req.user._id,
        });

        if (
          !patient ||
          invoice.patientId._id.toString() !==
            patient._id.toString()
        ) {
          return res.status(403).json({
            success: false,
            message: "Access denied",
          });
        }

        return res.status(200).json({
          success: true,
          invoice,
        });
      }

      // Doctors cannot access billing details
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Invalid invoice ID",
      });
    }
  }
);


// ===============================
// MARK INVOICE AS PAID
// ADMIN / RECEPTIONIST
// ===============================
router.put(
  "/:id/pay",
  verifyToken,
  authorizeRoles("admin", "receptionist"),
  async (req, res) => {
    try {
      const { paymentMethod } = req.body;

      const allowedMethods = [
        "cash",
        "card",
        "upi",
        "online",
      ];

      if (!allowedMethods.includes(paymentMethod)) {
        return res.status(400).json({
          success: false,
          message:
            "Valid paymentMethod is required: cash, card, upi, or online",
        });
      }

      const invoice = await Invoice.findById(req.params.id);

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found",
        });
      }

      if (invoice.paymentStatus === "paid") {
        return res.status(400).json({
          success: false,
          message: "Invoice is already paid",
        });
      }

      if (invoice.paymentStatus === "cancelled") {
        return res.status(400).json({
          success: false,
          message: "Cancelled invoice cannot be paid",
        });
      }

      invoice.paymentStatus = "paid";
      invoice.paymentMethod = paymentMethod;
      invoice.paidAt = new Date();

      await invoice.save();

      res.status(200).json({
        success: true,
        message: "Payment recorded successfully",
        invoice,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to process payment",
        error: error.message,
      });
    }
  }
);

export default router;