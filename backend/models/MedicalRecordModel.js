import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    medicineName: {
      type: String,
      required: true,
      trim: true,
    },

    dosage: {
      type: String,
      trim: true,
    },

    frequency: {
      type: String,
      trim: true,
    },

    duration: {
      type: String,
      trim: true,
    },

    instructions: {
      type: String,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const medicalRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
    },

    symptoms: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    diagnosis: {
      type: String,
      required: [true, "Diagnosis is required"],
      trim: true,
      maxlength: 2000,
    },

    treatmentNotes: {
      type: String,
      trim: true,
      maxlength: 3000,
    },

    prescription: {
      type: [prescriptionSchema],
      default: [],
    },

    followUpDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const MedicalRecord = mongoose.model(
  "MedicalRecord",
  medicalRecordSchema
);

export default MedicalRecord;