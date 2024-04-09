require("dotenv").config();
import { Response } from "express";
import { IAdmin } from "../models/admin.model";
import { IUser } from "../models/user.model";
import { redis } from "./redis";
import { json } from "stream/consumers";

interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}

// parse environment variables to ontegrates with fallback values
const accessTokenExpire = parseInt(
  process.env.ACCESS_TOKEN_EXPIRE || "300",
  10
);

const refreshTokenExpire = parseInt(
  process.env.REFRESH_TOKEN_EXPIRE || "1200",
  10
);

//options for cookies
export const accesstokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000),
  maxAge: accessTokenExpire * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

export const refreshtokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
  maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

export const sendToken = (user: IUser, statusCode: number, res: Response) => {
  const accessToken = user.SignAccessToken();
  const refreshToken = user.SignRefreshToken();

  // Upload session to Redis
  redis.set(user._id, JSON.stringify(user) as any);

  // Only set secure to true in production
  // if (process.env.NODE_ENV === "production") {
  //   accesstokenOptions.secure = true;
  // }

  res.cookie("access_token", accessToken, accesstokenOptions);
  res.cookie("refresh_token", refreshToken, refreshtokenOptions);

  res.status(statusCode).json({
    success: true,
    user,
    accessToken,
  });
};

export const sendAdminToken = (
  admin: IAdmin,
  statusCode: number,
  res: Response
) => {
  const accessToken = admin.SignAccessToken();
  const refreshToken = admin.SignRefreshToken();

  // Upload session to Redis
  redis.set(admin._id, JSON.stringify(admin) as any);

  // Only set secure to true in production
  // if (process.env.NODE_ENV === "production") {
  //   accesstokenOptions.secure = true;
  // }

  res.cookie("admin_access_token", accessToken, accesstokenOptions);
  res.cookie("admin_refresh_token", refreshToken, refreshtokenOptions);

  res.status(statusCode).json({
    success: true,
    admin,
    accessToken,
  });
};
