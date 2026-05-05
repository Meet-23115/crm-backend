import { Request, Response } from "express";
import { ApiResponse } from "../Api/ApiResponse";
import { asyncHandler } from "../Api/asyncHandler";
import { Project } from "../models/project.model";
import { Task, TaskStatus } from "../models/task.model";
import { User, UserRole } from "../models/user.model";
import { normalizeProgress, toId } from "../utils/serializers";

const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
  }

  const isAdmin = req.user.role === UserRole.ADMIN;
  const userId = req.user._id;

  const [projects, tasks, members] = await Promise.all([
    Project.find(isAdmin ? {} : { team: userId }).populate("team", "cred.fullName email role uuid status"),
    Task.find(isAdmin ? {} : { assignedTo: userId })
      .populate("assignedTo", "cred.fullName email uuid role")
      .populate("projectId", "name client deadline"),
    User.find(isAdmin ? {} : { _id: userId }).select("uuid email role cred.fullName cred.department cred.designation status"),
  ]);

  const projectIds = projects.map((project) => project._id);
  const relatedTasks = isAdmin
    ? tasks
    : await Task.find({ projectId: { $in: projectIds } })
        .populate("assignedTo", "cred.fullName email uuid role")
        .populate("projectId", "name client deadline");

  const tasksByProject = relatedTasks.reduce<Record<string, typeof relatedTasks>>(
    (acc, task) => {
      const key = toId(task.projectId._id);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(task);
      return acc;
    },
    {},
  );

  const projectSummaries = projects.map((project) => {
    const projectTasks = tasksByProject[toId(project._id)] || [];
    const completedTasks = projectTasks.filter(
      (task) => task.status === TaskStatus.DONE,
    ).length;
    const progress = projectTasks.length
      ? normalizeProgress(
          projectTasks.reduce((sum, task) => sum + task.progress, 0) /
            projectTasks.length,
        )
      : 0;

    return {
      id: toId(project._id),
      name: project.name,
      client: project.client,
      deadline: project.deadline,
      progress,
      taskCounts: {
        total: projectTasks.length,
        completed: completedTasks,
      },
    };
  });

  const visibleTasks = isAdmin ? relatedTasks : tasks;
  const formattedTasks = visibleTasks.slice(0, 8).map((task) => {
    const assignedTo = task.assignedTo as any;
    const project = task.projectId as any;

    return {
      id: toId(task._id),
      title: task.title,
      status: task.status,
      progress: task.progress,
      priority: task.priority,
      dueDate: task.dueDate,
      assignedTo: assignedTo
        ? {
            id: toId(assignedTo._id),
            fullName: assignedTo.cred?.fullName || "",
          }
        : null,
      project: project
        ? {
            id: toId(project._id),
            name: project.name,
          }
        : null,
    };
  });

  return res.json(
    new ApiResponse(200, {
      stats: {
        totalProjects: projects.length,
        totalTasks: visibleTasks.length,
        todoTasks: visibleTasks.filter((task) => task.status === TaskStatus.TODO)
          .length,
        inProgressTasks: visibleTasks.filter(
          (task) => task.status === TaskStatus.IN_PROGRESS,
        ).length,
        completedTasks: visibleTasks.filter(
          (task) => task.status === TaskStatus.DONE,
        ).length,
        totalMembers: isAdmin ? members.length : 1,
      },
      projects: projectSummaries,
      tasks: formattedTasks,
      members: members.slice(0, 8).map((member) => ({
        id: toId(member._id),
        uuid: member.uuid,
        email: member.email,
        role: member.role,
        fullName: member.cred.fullName,
        designation: member.cred.designation || "",
        department: member.cred.department || "",
        status: member.status,
      })),
    }),
  );
});

export { getDashboard };
