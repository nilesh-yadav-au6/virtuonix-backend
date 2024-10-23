import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import jwt from "jsonwebtoken";
import { z } from "zod";

function generateAccessToken(userId: { userId: string }) {
  return jwt.sign(userId, "sdfjgnjnsdnfnerun", { expiresIn: "1800s" });
}

const asyncHandler =
  (fn: any) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export const login = asyncHandler(
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const { email, password } = validatedData;

      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid credentials" });
      }

      // Compare the password with the hashed password in the database
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid credentials" });
      }

      const id = user._id as string;

      const token = generateAccessToken({ userId: id.toString() });

      let options = {
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
        signed: true,
      };

      res.cookie("token", token, options);
      res.status(200).json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      console.log(err);
      return res.status(500).json({ error: err });
    }
  }
);

export const logout = asyncHandler(
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      res.clearCookie("token", { httpOnly: true, sameSite: "strict" });

      return res
        .status(200)
        .json({ success: true, message: "Logged out successfully" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      return res.status(500).json({ error: "Server error" });
    }
  }
);
