import express from "express";
import Department from "../models/DepartmentModel.js";
import verifyToken from "../Middlewares/verifyToken.js";
import authorizeRoles from "../Middlewares/roleAuthorization.js";

const router = express.Router();


// CREATE DEPARTMENT
// Admin only

router.post(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Department name is required",
        });
      }

      const existingDepartment = await Department.findOne({
        name: name.trim(),
      });

      if (existingDepartment) {
        return res.status(409).json({
          success: false,
          message: "Department already exists",
        });
      }

      const department = await Department.create({
        name: name.trim(),
        description,
      });

      res.status(201).json({
        success: true,
        message: "Department created successfully",
        department,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create department",
        error: error.message,
      });
    }
  }
);




// GET ALL DEPARTMENTS

router.get("/", verifyToken, async (req, res) => {
  try {
    const departments = await Department.find({
      isActive: true,
    }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
    });
  }
});


// GET DEPARTMENT BY ID

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    res.status(200).json({
      success: true,
      department,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid department ID",
    });
  }
});





// UPDATE DEPARTMENT
// Admin only

router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { name, description, isActive } = req.body;

      const department = await Department.findById(req.params.id);

      if (!department) {
        return res.status(404).json({
          success: false,
          message: "Department not found",
        });
      }

      if (name !== undefined) {
        department.name = name.trim();
      }

      if (description !== undefined) {
        department.description = description;
      }

      if (isActive !== undefined) {
        department.isActive = isActive;
      }

      await department.save();

      res.status(200).json({
        success: true,
        message: "Department updated successfully",
        department,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update department",
        error: error.message,
      });
    }
  }
);





// DELETE / DEACTIVATE DEPARTMENT
// Admin only

router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const department = await Department.findById(req.params.id);

      if (!department) {
        return res.status(404).json({
          success: false,
          message: "Department not found",
        });
      }

      // Soft delete
      department.isActive = false;

      await department.save();

      res.status(200).json({
        success: true,
        message: "Department deactivated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to deactivate department",
      });
    }
  }
);

export default router;