import fs from "fs/promises";
import path from "path";
import pool from "../config/configDatabase";

const templatesDir = path.resolve(__dirname, "../../templates"); // Adjust this path as needed

export const importTemplateAttributes = async () => {
  try {
    const categories = await fs.readdir(templatesDir);

    for (const category of categories) {
      const categoryPath = path.join(templatesDir, category);
      const files = await fs.readdir(categoryPath);

      for (const file of files) {
        if (
          file.startsWith("variant") &&
          (file.endsWith(".js") || file.endsWith(".ts"))
        ) {
          const filePath = path.join(categoryPath, file);
          const relativeFilePath = path.relative(templatesDir, filePath);

          await addTemplateAttributeToDB(category, relativeFilePath);
          console.log(
            `File ${file} in category ${category} added to the database.`
          );
        }
      }
    }
  } catch (error) {
    console.error("Error importing template attributes:", error);
    throw error;
  }
};

const addTemplateAttributeToDB = async (category: string, filePath: string) => {
  const client = await pool.connect();
  try {
    const tableName = getTableNameFromCategory(category);

    // Check if the file path already exists in the database
    const checkRes = await client.query(
      `SELECT id FROM "Document generator".${tableName} WHERE path = $1`,
      [filePath]
    );

    if (checkRes.rows.length > 0) {
      console.log(
        `File ${filePath} already exists in ${category} table. Skipping addition.`
      );
      return;
    }

    await client.query(
      `INSERT INTO "Document generator".${tableName} (path) VALUES ($1)`,
      [filePath]
    );
  } catch (error) {
    console.error(
      `Error adding template attribute to ${category} table:`,
      error
    );
    throw error;
  } finally {
    client.release();
  }
};

const getTableNameFromCategory = (category: string): string => {
  switch (category) {
    case "invoiceHeader":
      return "invoice_header";
    case "invoiceBody":
      return "invoice_body";
    case "invoiceFooter":
      return "invoice_footer";
    case "headerFont":
      return "header_font";
    case "headerFontColour":
      return "header_font_colour";
    case "bodyFillColour":
      return "body_fill_colour";
    case "bodyAlignment":
      return "body_alignment";
    case "footerFont":
      return "footer_font";
    case "footerAlignment":
      return "footer_alignment";
    case "hasFrame":
      return "has_frame";
    default:
      throw new Error(`Unknown category: ${category}`);
  }
};
