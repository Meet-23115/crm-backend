import { Request, Response } from "express";
import { ApiResponse } from "../Api/ApiResponse";
import { asyncHandler } from "../Api/asyncHandler";
import { User, UserRole } from "../models/user.model";
import createUserUUID from "../utils/createUUID";
import { serializeUser } from "./user/user.controller";
import { Types } from "mongoose";

const memberProjection =
  "uuid email role cred.fullName cred.department cred.designation status";

const listMembers = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
  }

  const members = await User.find({ role: UserRole.MEMBER }).select(memberProjection);
  return res.json(
    new ApiResponse(
      200,
      members.map((member) => ({
        id: member._id.toString(),
        uuid: member.uuid,
        email: member.email,
        role: member.role,
        fullName: member.cred.fullName,
        designation: member.cred.designation || "",
        department: member.cred.department || "",
        status: member.status,
      })),
    ),
  );
});

const getMember = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid member id"));
  }

  const member = await User.findById(id).select(memberProjection);
  if (!member) {
    return res.status(404).json(new ApiResponse(404, null, "Member not found"));
  }

  return res.json(
    new ApiResponse(200, {
      id: member._id.toString(),
      uuid: member.uuid,
      email: member.email,
      role: member.role,
      fullName: member.cred.fullName,
      designation: member.cred.designation || "",
      department: member.cred.department || "",
      status: member.status,
    }),
  );
});

const createMember = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, fullName, designation, department, phoneNo } = req.body;

  if (!email || !password || !fullName) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Email, password and full name are required"));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json(new ApiResponse(409, null, "Email already exists"));
  }

  const uuid = await createUserUUID();
  const member = await User.create({
    email,
    password,
    uuid,
    role: UserRole.MEMBER,
    cred: {
      fullName,
      designation: designation || "",
      department: department || "",
      phoneNo: phoneNo || "",
    },
    status: "active",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, serializeUser(member), "Member created"));
});

const updateMember = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { email, fullName, designation, department, status, phoneNo } = req.body;

  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid member id"));
  }

  const member = await User.findById(id);
  if (!member) {
    return res.status(404).json(new ApiResponse(404, null, "Member not found"));
  }

  if (email) member.email = email;
  if (fullName) member.cred.fullName = fullName;
  if (designation !== undefined) member.cred.designation = designation;
  if (department !== undefined) member.cred.department = department;
  if (phoneNo !== undefined) member.cred.phoneNo = phoneNo;
  if (status === "active" || status === "inactive") member.status = status;

  await member.save();
  return res.json(
    new ApiResponse(200, {
      id: member._id.toString(),
      uuid: member.uuid,
      email: member.email,
      role: member.role,
      fullName: member.cred.fullName,
      designation: member.cred.designation || "",
      department: member.cred.department || "",
      status: member.status,
    }),
  );
});

const deleteMember = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid member id"));
  }

  const member = await User.findById(id);
  if (!member) {
    return res.status(404).json(new ApiResponse(404, null, "Member not found"));
  }

  if (member.role === UserRole.ADMIN) {
    return res.status(400).json(new ApiResponse(400, null, "Admin users cannot be deleted here"));
  }

  await member.deleteOne();
  return res.json(new ApiResponse(200, null, "Member deleted"));
});

export { listMembers, getMember, createMember, updateMember, deleteMember };
