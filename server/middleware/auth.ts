import { Response, NextFunction, Request } from "express";
import { CatchAsycError } from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import { redis } from "../utils/redis";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IUser } from "../models/user.model";

//authenticated user

declare module "express-serve-static-core" {
  interface Request {
    user?: IUser;
  }
}

export const isAuthenticated = CatchAsycError(
  async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token as string;

    if (!access_token) {
      return next(
        new ErrorHandler("Please login to access this resource", 400)
      );
    }

    const decoded = jwt.verify(
      access_token,
      process.env.ACCESS_TOKEN as string
    ) as JwtPayload;

    if (!decoded) {
      return next(new ErrorHandler("access token is not valid", 400));
    }
    const user = await redis.get(decoded.id);

    if (!user) {
      return next(new ErrorHandler("user not found", 400));
    }

    req.user = JSON.parse(user);

    next();
  }
);
