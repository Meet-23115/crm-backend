import { Request, Response } from "express";
import { Types } from "mongoose";
import { ApiResponse } from "../Api/ApiResponse";
import { asyncHandler } from "../Api/asyncHandler";
import { Project } from "../models/project.model";
import { Task, TaskPriority, TaskStatus } from "../models/task.model";
import { User, UserRole } from "../models/user.model";
import { normalizeProgress, toId } from "../utils/serializers";

const taskPopulate = [
  { path: "assignedTo", select: "cred.fullName email uuid role status" },
  { path: "projectId", select: "name client deadline team" },
];

const serializeTask = (task: any) => ({
  id: toId(task._id),
  title: task.title,
  description: task.description,
  status: task.status,
  priority: task.priority,
  progress: task.progress,
  dueDate: task.dueDate,
  createdBy: toId(task.createdBy),
  assignedTo: task.assignedTo
    ? {
        id: toId(task.assignedTo._id),
        uuid: task.assignedTo.uuid,
        email: task.assignedTo.email,
        role: task.assignedTo.role,
        fullName: task.assignedTo.cred?.fullName || "",
        status: task.assignedTo.status,
      }
    : null,
  project: task.projectId
    ? {
        id: toId(task.projectId._id),
        name: task.projectId.name,
        client: task.projectId.client,
        deadline: task.projectId.deadline,
      }
    : null,
});

const taskFilterForUser = (req: Request) => {
  if (!req.user) {
    return {};
  }

  return req.user.role === UserRole.ADMIN ? {} : { assignedTo: req.user._id };
};

const listTasks = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
  }

  const tasks = await Task.find(taskFilterForUser(req)).populate(taskPopulate);
  return res.json(new ApiResponse(200, tasks.map(serializeTask)));
});

const createTask = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
  }

  const {
    title,
    description,
    projectId,
    assignedTo,
    status,
    priority,
    progress,
    dueDate,
  } = req.body;

  if (!title || !projectId || !assignedTo || !dueDate) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Title, project, assignee and due date are required"));
  }

  const [project, member] = await Promise.all([
    Project.findById(projectId),
    User.findById(assignedTo),
  ]);

  if (!project) {
    return res.status(404).json(new ApiResponse(404, null, "Project not found"));
  }

  if (!member || member.role !== UserRole.MEMBER) {
    return res.status(404).json(new ApiResponse(404, null, "Assigned member not found"));
  }

  const normalizedTeam = project.team.map((id) => id.toString());
  if (!normalizedTeam.includes(member._id.toString())) {
    project.team = [...project.team, member._id];
    await project.save();
  }

  const task = await Task.create({
    title,
    description: description || "",
    projectId,
    assignedTo,
    createdBy: req.user._id,
    status: Object.values(TaskStatus).includes(status) ? status : TaskStatus.TODO,
    priority: Object.values(TaskPriority).includes(priority)
      ? priority
      : TaskPriority.MEDIUM,
    progress: normalizeProgress(Number(progress || 0)),
    dueDate,
  });

  const populatedTask = await Task.findById(task._id).populate(taskPopulate);
  return res
    .status(201)
    .json(new ApiResponse(201, serializeTask(populatedTask), "Task created"));
});

const getTask = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
  }

  const filter = {
    _id: req.params.id,
    ...taskFilterForUser(req),
  };
  const task = await Task.findOne(filter).populate(taskPopulate);
  if (!task) {
    return res.status(404).json(new ApiResponse(404, null, "Task not found"));
  }

  return res.json(new ApiResponse(200, serializeTask(task)));
});

const updateTask = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
  }

  const taskId = String(req.params.id);
  if (!Types.ObjectId.isValid(taskId)) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid task id"));
  }

  const task = await Task.findById(taskId);
  if (!task) {
    return res.status(404).json(new ApiResponse(404, null, "Task not found"));
  }

  const isAdmin = req.user.role === UserRole.ADMIN;
  const isAssignee = task.assignedTo.toString() === req.user._id.toString();

  if (!isAdmin && !isAssignee) {
    return res.status(403).json(new ApiResponse(403, null, "Forbidden"));
  }

  if (isAdmin) {
    const { title, description, projectId, assignedTo, status, priority, progress, dueDate } =
      req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (projectId && Types.ObjectId.isValid(projectId)) task.projectId = projectId;
    if (assignedTo && Types.ObjectId.isValid(assignedTo)) task.assignedTo = assignedTo;
    if (Object.values(TaskStatus).includes(status)) task.status = status;
    if (Object.values(TaskPriority).includes(priority)) task.priority = priority;
    if (progress !== undefined) task.progress = normalizeProgress(Number(progress));
    if (dueDate !== undefined) task.dueDate = dueDate;
  } else {
    const { status, progress } = req.body;
    if (Object.values(TaskStatus).includes(status)) task.status = status;
    if (progress !== undefined) task.progress = normalizeProgress(Number(progress));
  }

  if (task.status === TaskStatus.DONE && task.progress < 100) {
    task.progress = 100;
  }
  if (task.progress === 100 && task.status !== TaskStatus.DONE) {
    task.status = TaskStatus.DONE;
  }

  await task.save();
  const populatedTask = await Task.findById(task._id).populate(taskPopulate);
  return res.json(new ApiResponse(200, serializeTask(populatedTask), "Task updated"));
});

const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const taskId = String(req.params.id);
  if (!Types.ObjectId.isValid(taskId)) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid task id"));
  }

  const task = await Task.findById(taskId);
  if (!task) {
    return res.status(404).json(new ApiResponse(404, null, "Task not found"));
  }

  await task.deleteOne();
  return res.json(new ApiResponse(200, null, "Task deleted"));
});

export { listTasks, createTask, getTask, updateTask, deleteTask };
