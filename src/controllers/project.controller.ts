import { Request, Response } from "express";
import { Types } from "mongoose";
import { ApiResponse } from "../Api/ApiResponse";
import { asyncHandler } from "../Api/asyncHandler";
import { Project } from "../models/project.model";
import { Task, TaskStatus } from "../models/task.model";
import { UserRole } from "../models/user.model";
import { normalizeProgress, toId } from "../utils/serializers";

const ensureProjectAccess = async (req: Request, id: string) => {
  if (!Types.ObjectId.isValid(id) || !req.user) {
    return null;
  }

  const filter =
    req.user.role === UserRole.ADMIN
      ? { _id: id }
      : { _id: id, team: req.user._id };

  return Project.findOne(filter).populate("team", "cred.fullName email role uuid status");
};

const serializeProject = async (project: any) => {
  if (!project) {
    return null;
  }

  const tasks = await Task.find({ projectId: project._id }).populate(
    "assignedTo",
    "cred.fullName email uuid role",
  );

  const completed = tasks.filter((task) => task.status === TaskStatus.DONE).length;
  const progress = tasks.length
    ? normalizeProgress(tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length)
    : 0;

  return {
    id: toId(project._id),
    name: project.name,
    client: project.client,
    deadline: project.deadline,
    description: project.description,
    createdBy: toId(project.createdBy),
    progress,
    taskCounts: {
      total: tasks.length,
      completed,
    },
    team: project.team.map((member: any) => ({
      id: toId(member._id),
      uuid: member.uuid,
      email: member.email,
      role: member.role,
      fullName: member.cred?.fullName || "",
      status: member.status,
    })),
  };
};

const listProjects = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
  }

  const query = req.user.role === UserRole.ADMIN ? {} : { team: req.user._id };
  const projects = await Project.find(query).populate(
    "team",
    "cred.fullName email role uuid status",
  );
  const data = await Promise.all(projects.map((project) => serializeProject(project)));
  return res.json(new ApiResponse(200, data));
});

const createProject = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
  }

  const { name, description, team, client, deadline } = req.body;

  if (!name || !deadline) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Name and deadline are required"));
  }

  const normalizedTeam = Array.isArray(team)
    ? team.filter((memberId) => Types.ObjectId.isValid(memberId))
    : [];

  const project = await Project.create({
    name,
    description: description || "",
    team: normalizedTeam,
    client: client || "",
    deadline,
    createdBy: req.user._id,
  });

  const populatedProject = await Project.findById(project._id).populate(
    "team",
    "cred.fullName email role uuid status",
  );

  return res
    .status(201)
    .json(new ApiResponse(201, await serializeProject(populatedProject), "Project created"));
});

const getProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await ensureProjectAccess(req, String(req.params.id));
  if (!project) {
    return res.status(404).json(new ApiResponse(404, null, "Project not found"));
  }

  return res.json(new ApiResponse(200, await serializeProject(project)));
});

const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await ensureProjectAccess(req, String(req.params.id));
  if (!project) {
    return res.status(404).json(new ApiResponse(404, null, "Project not found"));
  }

  const { name, description, team, client, deadline } = req.body;
  if (name !== undefined) project.name = name;
  if (description !== undefined) project.description = description;
  if (client !== undefined) project.client = client;
  if (deadline !== undefined) project.deadline = deadline;
  if (Array.isArray(team)) {
    project.team = team.filter((memberId: string) => Types.ObjectId.isValid(memberId));
  }

  await project.save();

  const populatedProject = await Project.findById(project._id).populate(
    "team",
    "cred.fullName email role uuid status",
  );
  return res.json(
    new ApiResponse(200, await serializeProject(populatedProject), "Project updated"),
  );
});

const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await ensureProjectAccess(req, String(req.params.id));
  if (!project) {
    return res.status(404).json(new ApiResponse(404, null, "Project not found"));
  }

  await Task.deleteMany({ projectId: project._id });
  await project.deleteOne();
  return res.json(new ApiResponse(200, null, "Project deleted"));
});

export { listProjects, createProject, getProject, updateProject, deleteProject };
