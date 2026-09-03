import express from "express";
import Service from "../models/ServiceModel.js";
import Department from "../models/DepartmentModel.js";
import verifyToken from "../Middlewares/verifyToken.js";
import authorizeRoles from "../Middlewares/roleAuthorization.js";

const router = express.Router();


// ===============================
// CREATE SERVICE
// Admin only
// ===============================
router.post(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const {
        name,
        departmentId,
        description,
        price,
        duration,
      } = req.body;

      if (!name || !departmentId || price === undefined || duration === undefined) {
        return res.status(400).json({
          success: false,
          message:
            "name, departmentId, price and duration are required",
        });
      }

      // Check whether the department exists and is active
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

      const service = await Service.create({
        name: name.trim(),
        departmentId,
        description,
        price,
        duration,
      });

      res.status(201).json({
        success: true,
        message: "Service created successfully",
        service,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create service",
        error: error.message,
      });
    }
  }
);


// ===============================
// GET ALL ACTIVE SERVICES
// ===============================
router.get("/", verifyToken, async (req, res) => {
  try {
    const filter = {
      isActive: true,
    };

    // Optional department filter
    if (req.query.departmentId) {
      filter.departmentId = req.query.departmentId;
    }

    const services = await Service.find(filter)
      .populate("departmentId", "name description")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve services",
      error: error.message,
    });
  }
});


// ===============================
// GET SERVICE BY ID
// ===============================
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate(
      "departmentId",
      "name description"
    );

    if (!service || !service.isActive) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid service ID",
    });
  }
});


// ===============================
// UPDATE SERVICE
// Admin only
// ===============================
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      // Validate department if it is being changed
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

      const service = await Service.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!service) {
        return res.status(404).json({
          success: false,
          message: "Service not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Service updated successfully",
        service,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update service",
        error: error.message,
      });
    }
  }
);


// ===============================
// DEACTIVATE SERVICE
// Admin only
// ===============================
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const service = await Service.findById(req.params.id);

      if (!service) {
        return res.status(404).json({
          success: false,
          message: "Service not found",
        });
      }

      service.isActive = false;

      await service.save();

      res.status(200).json({
        success: true,
        message: "Service deactivated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to deactivate service",
      });
    }
  }
);

export default router;