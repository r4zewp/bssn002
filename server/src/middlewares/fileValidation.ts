import { Request, Response, NextFunction } from "express";
import path from "path";

export const validateExcelFile = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    return res.status(400).send("No files were uploaded.");
  }

  const file = req.file;
  const fileExtension = path.extname(file.originalname);
  if (fileExtension !== ".xlsx") {
    return res.status(400).send("Only .xlsx files are allowed.");
  }

  next();
};
