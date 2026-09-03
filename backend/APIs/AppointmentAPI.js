import express from "express";
import Appointment from "../models/AppointmentModel.js";
import Patient from "../models/PatientModel.js";
import Doctor from "../models/DoctorModel.js";
import Department from "../models/DepartmentModel.js";
import Service from "../models/ServiceModel.js";
import verifyToken from "../Middlewares/verifyToken.js";
import authorizeRoles from "../Middlewares/roleAuthorization.js";

const router = express.Router();

//helper functions

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
};

const parseAppointmentDate = (dateString) => {
  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day);
};


// ===============================
// CREATE APPOINTMENT
// ===============================
router.post(
  "/",
  verifyToken,
  authorizeRoles("patient", "receptionist", "admin"),
  async (req, res) => {
    try {
      const {
        patientId,
        doctorId,
        departmentId,
        serviceId,
        appointmentDate,
        startTime,
        reason,
      } = req.body;

      if (
        !doctorId ||
        !departmentId ||
        !serviceId ||
        !appointmentDate ||
        !startTime
      ) {
        return res.status(400).json({
          success: false,
          message:
            "doctorId, departmentId, serviceId, appointmentDate and startTime are required",
        });
      }

      let finalPatientId = patientId;

      // PATIENT BOOKS FOR THEMSELVES
      if (req.user.role === "patient") {
        const patientProfile = await Patient.findOne({
          userId: req.user._id,
          isActive: true,
        });

        if (!patientProfile) {
          return res.status(404).json({
            success: false,
            message: "Patient profile not found",
          });
        }

        finalPatientId = patientProfile._id;
      }

      // STAFF MUST PROVIDE A PATIENT ID
      if (
        (req.user.role === "admin" ||
          req.user.role === "receptionist") &&
        !finalPatientId
      ) {
        return res.status(400).json({
          success: false,
          message: "patientId is required when staff books an appointment",
        });
      }

      // Validate patient
      const patient = await Patient.findOne({
        _id: finalPatientId,
        isActive: true,
      });

      if (!patient) {
        return res.status(400).json({
          success: false,
          message: "Valid active patient not found",
        });
      }

      // Validate doctor
      const doctor = await Doctor.findOne({
        _id: doctorId,
        isActive: true,
      });

      if (!doctor) {
        return res.status(400).json({
          success: false,
          message: "Valid active doctor not found",
        });
      }

      // Validate department
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

      // Validate service
      const service = await Service.findOne({
        _id: serviceId,
        isActive: true,
      });

      if (!service) {
        return res.status(400).json({
          success: false,
          message: "Valid active service not found",
        });
      }

      // IMPORTANT:
      // Doctor must belong to the selected department
      if (doctor.departmentId.toString() !== departmentId) {
        return res.status(400).json({
          success: false,
          message:
            "Selected doctor does not belong to the selected department",
        });
      }

      // Service must belong to the selected department
      if (service.departmentId.toString() !== departmentId) {
        return res.status(400).json({
          success: false,
          message:
            "Selected service does not belong to the selected department",
        });
      }

      // Validate date
      const selectedDate = parseAppointmentDate(appointmentDate);

      if (isNaN(selectedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid appointment date",
        });
      }

      // Validate time format
      if (!/^\d{2}:\d{2}$/.test(startTime)) {
        return res.status(400).json({
          success: false,
          message: "Invalid start time format. Use HH:mm",
        });
      }

      const startMinutes = timeToMinutes(startTime);

      if (
        startMinutes < 0 ||
        startMinutes >= 24 * 60
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid start time",
        });
      }

      // Calculate end time using service duration
      const endMinutes = startMinutes + service.duration;

      if (endMinutes > 24 * 60) {
        return res.status(400).json({
          success: false,
          message: "Appointment cannot extend into the next day",
        });
      }

      const endTime = minutesToTime(endMinutes);

      // Check doctor availability
      const appointmentDay = selectedDate
        .toLocaleDateString("en-US", {
          weekday: "long",
        })
        .toLowerCase();

      const availability = doctor.availability.find(
        (slot) =>
          slot.day === appointmentDay &&
          slot.isAvailable === true
      );

      if (!availability) {
        return res.status(400).json({
          success: false,
          message: "Doctor is not available on the selected day",
        });
      }

      const availableStart = timeToMinutes(
        availability.startTime
      );

      const availableEnd = timeToMinutes(
        availability.endTime
      );

      if (
        startMinutes < availableStart ||
        endMinutes > availableEnd
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Selected time is outside doctor's available hours",
        });
      }

      // Check for overlapping appointments
      const existingAppointments = await Appointment.find({
        doctorId,
        appointmentDate: selectedDate,
        status: {
          $in: ["scheduled", "confirmed"],
        },
      });

      const hasConflict = existingAppointments.some(
        (appointment) => {
          const existingStart = timeToMinutes(
            appointment.startTime
          );

          const existingEnd = timeToMinutes(
            appointment.endTime
          );

          return (
            startMinutes < existingEnd &&
            endMinutes > existingStart
          );
        }
      );

      if (hasConflict) {
        return res.status(409).json({
          success: false,
          message:
            "Doctor already has an appointment during this time",
        });
      }

      // Create appointment
      const appointment = await Appointment.create({
        patientId: finalPatientId,
        doctorId,
        departmentId,
        serviceId,
        appointmentDate: selectedDate,
        startTime,
        endTime,
        reason,
        status: "scheduled",
      });

      res.status(201).json({
        success: true,
        message: "Appointment booked successfully",
        appointment,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to book appointment",
        error: error.message,
      });
    }
  }
);


// ===============================
// GET PATIENT'S OWN APPOINTMENTS
// ===============================
router.get(
  "/my-appointments",
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

      const appointments = await Appointment.find({
        patientId: patient._id,
      })
        .populate({
          path: "doctorId",
          populate: {
            path: "userId",
            select: "name email phone",
          },
        })
        .populate("departmentId", "name")
        .populate("serviceId", "name price duration")
        .sort({
          appointmentDate: -1,
          startTime: -1,
        });

      res.status(200).json({
        success: true,
        count: appointments.length,
        appointments,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve appointments",
        error: error.message,
      });
    }
  }
);


// ===============================
// GET DOCTOR'S OWN APPOINTMENTS
// ===============================
router.get(
  "/doctor-appointments",
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

      const appointments = await Appointment.find({
        doctorId: doctor._id,
      })
        .populate({
          path: "patientId",
          populate: {
            path: "userId",
            select: "name email phone",
          },
        })
        .populate("departmentId", "name")
        .populate("serviceId", "name duration")
        .sort({
          appointmentDate: -1,
          startTime: -1,
        });

      res.status(200).json({
        success: true,
        count: appointments.length,
        appointments,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve doctor appointments",
        error: error.message,
      });
    }
  }
);

// ===============================
// GET ALL APPOINTMENTS
// ADMIN / RECEPTIONIST
// ===============================
router.get(
  "/",
  verifyToken,
  authorizeRoles("admin", "receptionist"),
  async (req, res) => {
    try {
      const appointments = await Appointment.find()
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
        .populate("departmentId", "name")
        .populate("serviceId", "name price duration")
        .sort({
          appointmentDate: -1,
          startTime: -1,
        });

      res.status(200).json({
        success: true,
        count: appointments.length,
        appointments,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve appointments",
        error: error.message,
      });
    }
  }
);


// ===============================
// GET APPOINTMENT BY ID
// ===============================
router.get(
  "/:id",
  verifyToken,
  async (req, res) => {
    try {
      const appointment = await Appointment.findById(req.params.id)
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
        .populate("departmentId", "name")
        .populate("serviceId", "name price duration");

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found",
        });
      }

      // ADMIN AND RECEPTIONIST CAN VIEW ALL
      if (
        req.user.role === "admin" ||
        req.user.role === "receptionist"
      ) {
        return res.status(200).json({
          success: true,
          appointment,
        });
      }

      // PATIENT CAN VIEW ONLY OWN APPOINTMENT
      if (req.user.role === "patient") {
        const patient = await Patient.findOne({
          userId: req.user._id,
        });

        if (
          !patient ||
          appointment.patientId._id.toString() !== patient._id.toString()
        ) {
          return res.status(403).json({
            success: false,
            message: "Access denied",
          });
        }
      }

      // DOCTOR CAN VIEW ONLY THEIR APPOINTMENT
      if (req.user.role === "doctor") {
        const doctor = await Doctor.findOne({
          userId: req.user._id,
        });

        if (
          !doctor ||
          appointment.doctorId._id.toString() !== doctor._id.toString()
        ) {
          return res.status(403).json({
            success: false,
            message: "Access denied",
          });
        }
      }

      res.status(200).json({
        success: true,
        appointment,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }
  }
);


// ===============================
// UPDATE APPOINTMENT STATUS
// ===============================
router.put(
  "/:id/status",
  verifyToken,
  async (req, res) => {
    try {
      const { status } = req.body;

      const appointment = await Appointment.findById(req.params.id);

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found",
        });
      }

      // ===============================
      // PATIENT CANCELLATION
      // ===============================
      if (req.user.role === "patient") {
        if (status !== "cancelled") {
          return res.status(403).json({
            success: false,
            message: "Patients can only cancel appointments",
          });
        }

        const patient = await Patient.findOne({
          userId: req.user._id,
        });

        if (
          !patient ||
          appointment.patientId.toString() !== patient._id.toString()
        ) {
          return res.status(403).json({
            success: false,
            message: "You can only cancel your own appointments",
          });
        }

        if (
          appointment.status === "completed" ||
          appointment.status === "cancelled"
        ) {
          return res.status(400).json({
            success: false,
            message: "This appointment cannot be cancelled",
          });
        }

        appointment.status = "cancelled";
      }

      // ===============================
      // ADMIN / RECEPTIONIST
      // ===============================
      else if (
        req.user.role === "admin" ||
        req.user.role === "receptionist"
      ) {
        if (!["confirmed", "cancelled"].includes(status)) {
          return res.status(403).json({
            success: false,
            message:
              "Admin and receptionist can only confirm or cancel appointments",
          });
        }

        if (
          appointment.status === "completed" ||
          appointment.status === "cancelled"
        ) {
          return res.status(400).json({
            success: false,
            message: "This appointment status cannot be changed",
          });
        }

        appointment.status = status;
      }

      // ===============================
      // DOCTOR COMPLETES APPOINTMENT
      // ===============================
      else if (req.user.role === "doctor") {
        if (status !== "completed") {
          return res.status(403).json({
            success: false,
            message: "Doctors can only complete appointments",
          });
        }

        const doctor = await Doctor.findOne({
          userId: req.user._id,
        });

        if (
          !doctor ||
          appointment.doctorId.toString() !== doctor._id.toString()
        ) {
          return res.status(403).json({
            success: false,
            message:
              "You can only complete your own appointments",
          });
        }

        if (appointment.status !== "confirmed") {
          return res.status(400).json({
            success: false,
            message:
              "Only confirmed appointments can be completed",
          });
        }

        appointment.status = "completed";
      }

      // Unknown role
      else {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      await appointment.save();

      res.status(200).json({
        success: true,
        message: "Appointment status updated successfully",
        appointment,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update appointment status",
        error: error.message,
      });
    }
  }
);





export default router;