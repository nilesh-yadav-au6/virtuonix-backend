import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import User, { IUser } from "../models/User";
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" }),
  profession: z.enum(["Engineer", "Doctor"], {
    required_error: "Please select a profession",
  }),
});

const asyncHandler =
  (fn: any) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const validatedData = userSchema.parse(req.body);

      const { name, email, password, phone, profession } = validatedData;

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(201).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser: IUser = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        profession,
        token: "",
      });

      await newUser.save();
      return res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      return res.status(500).json({ error: "Server error" });
    }
  }
);

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const updateSchema = z.object({
    name: z.string().optional(),
    phone: z
      .string()
      .min(10, { message: "Phone number must be at least 10 digits" })
      .optional(),
  });

  try {
    const validatedData = updateSchema.parse(req.body);

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { new: true }
    );
    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    return res.json(updatedUser);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ errors: err.errors });
    }
    return res.status(500).json({ error: "Server error" });
  }
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (req.params.id == req.user.userId) {
      return res.json({ message: "Can not delete the logged in user" });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ message: "User deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  try {
    const user = await User.find({}).select("_id name email phone");
    if (!user) return res.status(404).json({ message: "Users not found" });

    return res.json({ users: user });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});
