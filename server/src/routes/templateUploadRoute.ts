import { Router, Request, Response } from "express";
import multer from "multer";
import { validateTemplateFile } from "../middlewares/templateValidation";
import { validateApiKey } from "../middlewares/validateApiKey";
import {
  uploadTemplateFile,
  addTemplateAttributeToDB,
} from "../services/templateUploadService";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

router.post(
  "/upload-attribute",
  validateApiKey,
  upload.single("file"),
  validateTemplateFile,
  async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).send("Файлы не были загружены.");
    }

    const file = req.file;
    const { category, tableName } = req.body;

    if (!category || !tableName) {
      return res.status(400).send("Категория и tableName обязательны.");
    }

    try {
      const uploadedTemplate = await uploadTemplateFile(
        file.buffer,
        file.originalname,
        category
      );
      await addTemplateAttributeToDB(tableName, uploadedTemplate.filePath);

      res.json({
        message: "Файл шаблона загружен и атрибут добавлен в базу данных.",
      });
    } catch (error) {
      console.error(
        "Ошибка при загрузке файла шаблона и добавлении атрибута в базу данных:",
        error
      );
      res.status(500).send("Внутренняя ошибка сервера");
    }
  }
);

export default router;
