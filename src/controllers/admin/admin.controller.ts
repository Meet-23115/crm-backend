import { Request, Response } from "express";
import createUserUUID from "../../utils/createUUID";
import { asyncHandler } from "../../Api/asyncHandler";
import { User } from "../../models/user.model";
import { ApiResponse } from "../../Api/ApiResponse";

interface CreateUserRequestBody {
  data: {
    email: string;
    role: string; // You can adjust the type of 'role' based on your system (e.g., enum or string)
    password: string; // Assuming you want to include a password field
  };
}

const createUser = asyncHandler(
  async (req: Request<{}, {}, CreateUserRequestBody>, res: Response) => {
    console.log(req.body.data);
    const { data } = req.body;
    const { email, role, password } = data;
    console.log(email, role);
    try {
      const uuid = await createUserUUID();
      console.log(uuid);

      await User.create({
        email: email,
        role: role,
        password: password, // Make sure to hash the password before storing it in a real application
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
