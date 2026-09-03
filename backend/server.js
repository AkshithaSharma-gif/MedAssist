import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRouter from "./APIs/AuthAPI.js";
import departmentRouter from "./APIs/DepartmentAPI.js";
import patientRouter from "./APIs/PatientAPI.js";
import doctorRouter from "./APIs/DoctorAPI.js";
import serviceRouter from "./APIs/ServiceAPI.js";
import appointmentRouter from "./APIs/AppointmentAPI.js";
import medicalRecordRouter from "./APIs/MedicalRecordAPI.js";
import invoiceRouter from "./APIs/InvoiceAPI.js";

import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const app = express();

const PORT = process.env.PORT || 5000;


// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));


//routes
app.use("/api/auth", authRouter);
app.use("/api/departments", departmentRouter);
app.use("/api/patients", patientRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/services", serviceRouter);
app.use("/api/appointments", appointmentRouter);
app.use("/api/medical-records", medicalRecordRouter);
app.use("/api/invoices", invoiceRouter);


// Test route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MedAssist API is running successfully",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`MedAssist server running on port ${PORT}`);
});