import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../db";

const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// User Registration
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: "User already exists" });
      return;
    }
    // Hash the pass before storing
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });
    res.json({ message: "User registered successfully", userId: user.id });
    return;
  } catch (error) {
    res.status(500).json({ error: "Server error" });
    return;
  }
});

// User Login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    // Compare user provided pass with stored hashed pass
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    // Sign in with a JWT token that expires in 1 hr
    const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ token });
    return;
  } catch (error) {
    res.status(500).json({ error: "Server error" });
    return;
  }
});

export default router;
