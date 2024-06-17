import { Request, Response, NextFunction } from "express";
import path from "path";

export const validateTemplateFile = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    return res.status(400).send("Файлы не были загружены.");
  }

  const file = req.file;
  const fileExtension = path.extname(file.originalname);
  if (fileExtension !== ".js" && fileExtension !== ".ts") {
    return res.status(400).send("Допустимы только .js или .ts файлы.");
  }

  next();
};
