import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key"; // TODO: Change in prod

export const authenticateUser = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access denied. No token provided." });
    return;
  }

  try {
    // Expect a payload with at least a userId; email is optional.
    const decoded = jwt.verify(token, SECRET_KEY) as { userId: string; email?: string };
    // Attach the decoded token to req.user using a type cast to bypass TypeScript errors
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

