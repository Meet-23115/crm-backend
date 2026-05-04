import { Request, Response } from "express";
import createUserUUID from "../../utils/createUUID";
import { asyncHandler } from "../../Api/asyncHandler";
import { User } from "../../models/user.model";
import { ApiResponse } from "../../Api/ApiResponse";

interface CreateUserRequestBody {
  data: {
    email: string;
    role: string; // You can adjust the type of 'role' based on your system (e.g., enum or string)
  };
}

const createUser = asyncHandler(
  async (req: Request<{}, {}, CreateUserRequestBody>, res: Response) => {
    console.log(req.body);
    const { data } = req.body;
    const { email, role } = data;
    console.log(email, role);
    try {
      const uuid = await createUserUUID();

      await User.create({
        email: email,
        role: role,
        uuid: uuid,
      }).then((user) => {
        res.json(new ApiResponse(200, user, "User created successfully"));
      });
    } catch (error) {
      console.log(error);
      res.json(new ApiResponse(400, "", "Error creating user"));
    }
  },
);

export { createUser };
