import { Request, Response, NextFunction } from "express";
import { config } from "dotenv";

const environment = process.env.ENVIRONMENT || "dev";
const envFile = environment === "dev" ? ".env.dev" : ".env.prod";

config({ path: envFile });
const API_KEY = process.env.API_KEY;

export const validateApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || apiKey !== API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API key" });
  }

  next();
};
