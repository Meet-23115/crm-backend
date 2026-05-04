import { Request, Response } from "express";
import { ApiResponse } from "../../Api/ApiResponse";
import { asyncHandler } from "../../Api/asyncHandler";
import { Project } from "../../models/project.model";

const createProject = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { name, description, team, client, deadline } = req.body;
    const createdBy = req.user?._id;

    
    if (!name || !deadline) {
      return res.json(new ApiResponse(400, null, "Name and deadline are required"));
    }

    const project = await Project.create({
      name,
      description,
      team,
      client,
      deadline,
      createdBy,
    });

    res.json(new ApiResponse(200, project));
  } catch (error) {
    console.error(error);
    res.json(new ApiResponse(400, null));
  }
});

export { createProject };
