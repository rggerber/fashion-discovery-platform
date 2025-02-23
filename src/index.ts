// SERVER FILE - create basic Express server
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fashionRoutes from "./routes/fashion";
import authRoutes from "./routes/auth";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/fashion", fashionRoutes);
app.use("/auth", authRoutes);

app.listen(3000, () => console.log("Server running on port 3000"));
