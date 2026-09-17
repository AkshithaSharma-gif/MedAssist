import express from "express";
import Notification from "../models/NotificationModel.js";
import verifyToken from "../Middlewares/verifyToken.js";

const router = express.Router();

// ===============================
// GET MY NOTIFICATIONS
// ===============================
router.get(
  "/",
  verifyToken,
  async (req, res) => {
    try {
      const notifications = await Notification.find({
        userId: req.user._id,
      })
        .populate("appointmentId")
        .populate("invoiceId")
        .sort({ createdAt: -1 });

      const unreadCount = await Notification.countDocuments({
        userId: req.user._id,
        isRead: false,
      });

      res.status(200).json({
        success: true,
        count: notifications.length,
        unreadCount,
        notifications,
      });
    } catch (error) {
      console.error("Get notifications error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to retrieve notifications",
        error: error.message,
      });
    }
  }
);

// ===============================
// MARK NOTIFICATION AS READ
// ===============================
router.put(
  "/:id/read",
  verifyToken,
  async (req, res) => {
    try {
      const notification = await Notification.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      notification.isRead = true;
      await notification.save();

      res.status(200).json({
        success: true,
        message: "Notification marked as read",
        notification,
      });
    } catch (error) {
      console.error("Mark notification error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to update notification",
        error: error.message,
      });
    }
  }
);

// ===============================
// MARK ALL NOTIFICATIONS AS READ
// ===============================
router.put(
  "/read-all",
  verifyToken,
  async (req, res) => {
    try {
      await Notification.updateMany(
        {
          userId: req.user._id,
          isRead: false,
        },
        {
          $set: { isRead: true },
        }
      );

      res.status(200).json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Mark all notifications error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to update notifications",
        error: error.message,
      });
    }
  }
);

export default router;