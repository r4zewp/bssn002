import path from "path";
import fs from "fs/promises";
import pool from "../config/configDatabase";

// Функция для загрузки файла шаблона
export const uploadTemplateFile = async (
  fileBuffer: Buffer,
  originalName: string,
  category: string
): Promise<{ filePath: string }> => {
  try {
    if (!fileBuffer) {
      throw new Error("File buffer is undefined");
    }

    const baseDir = path.join(__dirname, "../../templates", category);
    await fs.mkdir(baseDir, { recursive: true });

    const files = await fs.readdir(baseDir);
    const variantNumber = files.length + 1;
    const fileExtension = path.extname(originalName);
    const fileName = `variant${variantNumber}${fileExtension}`;
    const filePath = path.join(baseDir, fileName);
    const relativeFilePath = path.join(category, fileName); // относительный путь для базы данных

    // Логирование пути и данных файла
    console.log(`Saving file to: ${filePath}`);
    console.log(`File buffer length: ${fileBuffer.length}`);

    // Сохраните файл
    await fs.writeFile(filePath, fileBuffer);

    return { filePath: relativeFilePath };
  } catch (error) {
    console.error("Ошибка при загрузке файла шаблона:", error);
    throw error;
  }
};

// Функция для добавления атрибута шаблона в базу данных
export const addTemplateAttributeToDB = async (
  tableName: string,
  filePath: string
): Promise<void> => {
  const client = await pool.connect();
  try {
    const query = `INSERT INTO "Document generator".${tableName} (path) VALUES ($1)`;
    const values = [filePath];

    await client.query(query, values);
    console.log(
      `New template attribute added to ${tableName} with path: ${filePath}`
    );
  } catch (error) {
    console.error(
      `Ошибка при добавлении атрибута шаблона в таблицу ${tableName}:`,
      error
    );
    throw error;
  } finally {
    client.release();
  }
};
