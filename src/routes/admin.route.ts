import { Router } from "express";
import {
  createMember,
  deleteMember,
  getMember,
  listMembers,
  updateMember,
} from "../controllers/member.controller";
import { authorize, Role } from "../middlewares/authorization.middleware";
import { userAuth } from "../middlewares/authentication.middleware";

const router = Router();

router.use(userAuth, authorize(Role.ADMIN));

router.get("/", listMembers);
router.post("/", createMember);
router.get("/:id", getMember);
router.put("/:id", updateMember);
router.delete("/:id", deleteMember);

export default router;
