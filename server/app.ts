require("dotenv").config();
import express, { Request, Response, NextFunction } from "express";
export const app = express();
import cookieParser from "cookie-parser";
import cors from "cors";
import { ErrorMiddleware } from "./middleware/error";
import userRouter from "./routes/user.route";
import adminRouter from "./routes/admin.route";

//body-paser
app.use(express.json({ limit: "50mb" }));

//cookie parser
app.use(cookieParser());

//cors - cross origin resource sharing

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

// app.use(
//   cors({
//     origin: process.env.ORIGIN,
//   })
// );

app.use("/api/v1", userRouter);
app.use("/api/v1", adminRouter);

app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  console.log("welcome to server");
  res.send("welcome to server");
});

//unknown routes
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

app.use(ErrorMiddleware);
