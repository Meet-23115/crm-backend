import mongoose, { Schema } from "mongoose";

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    team: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    client: String,
    createdBy: mongoose.Schema.Types.ObjectId,
    deadline: {
      type: String,
      required: true,
    },
    description: String,
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
  },
  { timestamps: true }
);

export const Project = mongoose.model("Project", projectSchema);
