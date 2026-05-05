import { Request, Response } from "express";
import { ApiResponse } from "../../Api/ApiResponse";
import { asyncHandler } from "../../Api/asyncHandler";
import { User, UserDocument } from "../../models/user.model";

const cookieOptions = {
  httpOnly: true,
  secure: false,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  sameSite: "lax" as const,
};

const serializeUser = (user: UserDocument) => ({
  id: user._id.toString(),
  uuid: user.uuid,
  email: user.email,
  role: user.role,
  fullName: user.cred.fullName,
  designation: user.cred.designation || "",
  department: user.cred.department || "",
  status: user.status,
});

const LoginUser = asyncHandler(async (req: Request, res: Response) => {
  const { uuid, password }: { uuid?: string; password?: string } = req.body;

  if (!uuid || !password) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "UUID and password are required"));
  }

  const user = await User.findOne({ uuid });
  if (!user) {
    return res.status(401).json(new ApiResponse(401, null, "User not found"));
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Password incorrect"));
  }

  const refreshToken = user.generateRefreshToken();
  const accessToken = user.generateAccessToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return res
    .cookie("accessToken", accessToken, cookieOptions)
    .json(new ApiResponse(200, serializeUser(user), "Login success"));
});

const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
  }

  return res.json(
    new ApiResponse(200, serializeUser(req.user)),
  );
});

const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  if (req.user) {
    req.user.refreshToken = "";
    await req.user.save({ validateBeforeSave: false });
  }

  return res
    .clearCookie("accessToken", cookieOptions)
    .json(new ApiResponse(200, null, "Logout success"));
});

export { LoginUser, getCurrentUser, logoutUser, serializeUser };
