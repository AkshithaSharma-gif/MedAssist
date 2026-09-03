import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
      maxlength: 150,
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    price: {
      type: Number,
      required: [true, "Service price is required"],
      min: 0,
    },

    duration: {
      type: Number,
      required: [true, "Service duration is required"],
      min: 1,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Service = mongoose.model("Service", serviceSchema);

export default Service;