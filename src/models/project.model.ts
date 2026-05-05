import mongoose, { Document, Schema } from "mongoose";

export interface ProjectDocument extends Document {
  name: string;
  team: mongoose.Types.ObjectId[];
  client: string;
  createdBy: mongoose.Types.ObjectId;
  deadline: Date;
  description: string;
}

const projectSchema = new Schema<ProjectDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    team: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    client: { type: String, default: "", trim: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    description: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

export const Project = mongoose.model<ProjectDocument>("Project", projectSchema);
