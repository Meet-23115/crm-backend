import { Router } from "express";
import { getDashboard } from "../controllers/dashboard.controller";
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  updateProject,
} from "../controllers/project.controller";
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
} from "../controllers/task.controller";
import { listMembers, getMember } from "../controllers/member.controller";
import { userAuth } from "../middlewares/authentication.middleware";
import { authorize, Role } from "../middlewares/authorization.middleware";

const router = Router();

router.get("/dashboard", userAuth, getDashboard);

router.get("/projects", userAuth, listProjects);
router.post("/projects", userAuth, authorize(Role.ADMIN), createProject);
router.get("/projects/:id", userAuth, getProject);
router.put("/projects/:id", userAuth, authorize(Role.ADMIN), updateProject);
router.delete("/projects/:id", userAuth, authorize(Role.ADMIN), deleteProject);

router.get("/tasks", userAuth, listTasks);
router.post("/tasks", userAuth, authorize(Role.ADMIN), createTask);
router.get("/tasks/:id", userAuth, getTask);
router.put("/tasks/:id", userAuth, updateTask);
router.delete("/tasks/:id", userAuth, authorize(Role.ADMIN), deleteTask);

router.get("/members", userAuth, listMembers);
router.get("/members/:id", userAuth, getMember);

export default router;
