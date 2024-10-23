import express from "express";
import { login, logout } from "../controllers/authControllers";
import { authenticateToken } from "../middleware/middlware";

const router = express.Router();

router.post("/login", login);
router.delete("/logout", authenticateToken as express.RequestHandler, logout);

export default router;
