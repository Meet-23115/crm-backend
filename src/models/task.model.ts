import mongoose, { Document, Schema } from "mongoose";

export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  DONE = "done",
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export interface TaskDocument extends Document {
  title: string;
  description: string;
  projectId: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  dueDate: Date;
}

const taskSchema = new Schema<TaskDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.TODO,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
    },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    dueDate: { type: Date, required: true },
  },
  { timestamps: true },
);

export const Task = mongoose.model<TaskDocument>("Task", taskSchema);
