require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import adminModel, { IAdmin } from "../models/admin.model";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsycError } from "../middleware/catchAsyncErrors";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import {
  accesstokenOptions,
  refreshtokenOptions,
  sendAdminToken,
} from "../utils/jwt";
import { redis } from "../utils/redis";
import { getUserById } from "../services/user.services";
import cloudinary from "cloudinary";

interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export const registrationAdmin = CatchAsycError(
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log("reached here");
    try {
      console.log("Reached Link");
      const { name, email, password, gender } = req.body;
      console.log(gender);

      const isEmailExist = await adminModel.findOne({ email });
      console.log("isEmailExist:", isEmailExist);

      if (isEmailExist) {
        return next(new ErrorHandler("Email already exist", 400));
      }

      //   const activationToken = createActivationToken(admin);
      //   const activationCode = activationToken.activationCode;
      try {
        const admin = await adminModel.create({
          name,
          email,
          gender,
          password,
          isVerified: true,
        });

        res.status(201).json({
          success: true,
        });
      } catch (error: any) {
        console.log("errr2");
        return next(new ErrorHandler(error.mesage, 400));
      }
    } catch (error: any) {
      console.log("errr2");
      return next(new ErrorHandler(error.mesage, 400));
    }
  }
);

//login user
interface ILoginRequest {
  email: string;
  password: string;
}

export const loginAdmin = CatchAsycError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as ILoginRequest;

      if (!email || !password) {
        return next(new ErrorHandler("Please enter email and password", 400));
      }

      const admin = await adminModel.findOne({ email }).select("+password");

      if (!admin) {
        return next(new ErrorHandler("Invalid email or password", 400));
      }

      const isPasswordMatch = await admin.comparePassword(password);
      if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid email or password", 400));
      }
      sendAdminToken(admin, 200, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//logout user
declare module "express-serve-static-core" {
  interface Request {
    admin?: IAdmin;
  }
}

export const logoutAdmin = CatchAsycError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie("admin_access_token", "", { maxAge: 1 });
      res.cookie("admin_refresh_token", "", { maxAge: 1 });
      const adminId = req.admin?._id || "";
      redis.del(adminId);
      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//update access token
export const updateAccessToken = CatchAsycError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refresh_token = req.cookies.refresh_token as string;

      const decoded = jwt.verify(
        refresh_token,
        process.env.REFERSH_TOKEN as string
      ) as JwtPayload;

      const message = "Could not refersh token";
      if (!decoded) {
        return next(new ErrorHandler(message, 400));
      }
      const session = await redis.get(decoded.id as string);

      if (!session) {
        return next(new ErrorHandler(message, 400));
      }

      const user = JSON.parse(session);

      const accessToken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN as string,
        {
          expiresIn: "5m",
        }
      );
      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.REFERSH_TOKEN as string,
        {
          expiresIn: "3d",
        }
      );

      req.user = user;

      res.cookie("access_token", accessToken, accesstokenOptions);
      res.cookie("refresh_token", refreshToken, refreshtokenOptions);

      res.status(200).json({
        status: "success",
        accessToken,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// get user info
export const getuserInfo = CatchAsycError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      getUserById(userId, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
