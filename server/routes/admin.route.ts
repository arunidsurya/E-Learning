import express from "express";
import {
  loginAdmin,
  logoutAdmin,
  registrationAdmin,
} from "../controllers/admin.controllers";

const adminRouter = express.Router();

adminRouter.post("/admin_registration", registrationAdmin);

adminRouter.post("/admin_login", loginAdmin);

adminRouter.get("/admin_logout", logoutAdmin);

export default adminRouter;
