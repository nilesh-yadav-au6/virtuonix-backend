import express, { Request, Response } from "express";
import { authenticateToken } from "../middleware/middlware";
import {
  registerUser,
  updateUser,
  deleteUser,
  getAllUsers,
} from "../controllers/userControllers";

const router = express.Router();

// Route to register a user
router.post("/register", registerUser);
router.get(
  "/getAllUsers",
  authenticateToken as express.RequestHandler,
  getAllUsers
);
router.put(
  "/users/:id",
  authenticateToken as express.RequestHandler,
  updateUser
);
router.delete(
  "/users/:id",
  authenticateToken as express.RequestHandler,
  deleteUser
);

export default router;
