import { Request, Response } from "express";
import { ApiResponse } from "../../Api/ApiResponse";
import { asyncHandler } from "../../Api/asyncHandler";
import { User } from "../../models/user.model";

const LoginUser = asyncHandler(async (req: Request, res: Response) => {
  const { uuid, password }: { uuid: string; password: string } = req.body;
  const user = await User.findOne({ uuid });
  if (!user) {
    return res.json(new ApiResponse(402, null, "user not found"));
  }
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    return res.json(new ApiResponse(402, null, "password incorrect"));
  }

  const refreshToken = user.generateRefreshToken();
  const accessToken = user.generateAccessToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      maxAge: 604800000,
      sameSite: "lax",
    })
    .json(new ApiResponse(200, user, "login success"));
});

export { LoginUser };