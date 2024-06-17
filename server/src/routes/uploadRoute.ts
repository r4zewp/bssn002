import { Router, Request, Response } from "express";
import multer from "multer";
import { validateApiKey } from "../middlewares/validateApiKey";
import { validateExcelFile } from "../middlewares/fileValidation";
import { parseExcelFile } from "../utils/excelParser";
import { getOurCompanyByName } from "../services/ourCompanyService";
import {
  generateInvoiceTemplate,
  generatePDF,
} from "../services/invoiceHTMLGeneratorService";
import path from "path";
import fs from "fs";
import {
  addOrUpdateCounterparty,
  Counterparty,
  getCounterpartyByName,
} from "../services/counterpartyService";
import { getTemplateData } from "../services/templateService";
import ConvertAPI from "convertapi"; // Импорт ConvertAP
import {
  Invoice,
  addInvoice,
  checkInvoiceExists,
} from "../services/invoiceService";
import { config } from "dotenv";

const environment = process.env.ENVIRONMENT || "dev";
const envFile = environment === "dev" ? ".env.dev" : ".env.prod";

config({ path: envFile });
// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });
const convertapi = new ConvertAPI(process.env.CONVERTER_API_KEY!);
console.log(process.env.CONVERTER_API_KEY);
const router = Router();

router.post(
  "/upload-files",
  validateApiKey,
  upload.single("file"),
  validateExcelFile,
  async (req: Request, res: Response) => {
    const { uuid } = req.body;

    if (!req.file) {
      return res.status(400).send("No files were uploaded.");
    }

    if (!uuid) {
      return res.status(400).send("UUID is required.");
    }

    const file = req.file;

    try {
      const data = await parseExcelFile(file.buffer);

      for (const item of data) {
        const customer = await getOurCompanyByName(item.ourCompany);
        if (!customer) {
          throw new Error(`Our company ${item.ourCompany} not found`);
        }

        const supplier: Counterparty = {
          name: item.counterparty,
          address: item.address,
          swift: item.swift,
          bankAccountNumber: item.iban || item.bankAccount,
        };

        await addOrUpdateCounterparty(supplier);

        const invoice: Invoice = {
          ourCompany: item.ourCompany,
          principal: item.principal,
          rsNumber: item.rsNumber,
          counterparty: item.counterparty,
          country: item.country,
          address: item.address,
          iban: item.iban,
          tin: item.tin,
          bankAccount: item.bankAccount,
          swift: item.swift,
          invoiceNumber: item.invoiceNumber,
          amount: item.amount,
          currency: item.currency,
          bankName: item.bankName,
          invoiceDate: item.invoiceDate,
          description: item.description,
        };

        const counterpartyData = await getCounterpartyByName(supplier.name);
        if (!counterpartyData) {
          throw new Error(`Counterparty ${supplier.name} not found`);
        }

        const templateData = await getTemplateData(counterpartyData.id!);
        if (!templateData) {
          throw new Error(`Template data for ${supplier.name} not found`);
        }

        const existingInvoice = await checkInvoiceExists(invoice);
        if (existingInvoice) {
          console.log(
            `Invoice ${invoice.invoiceNumber} already exists. Skipping generation.`
          );
          continue;
        }

        const htmlTemplate = await generateInvoiceTemplate(
          templateData,
          invoice,
          supplier,
          customer
        );

        const outputDir = path.join(__dirname, "../../output", uuid);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const pdfFilePath = path.join(
          outputDir,
          `${invoice.counterparty} ${invoice.amount}${invoice.currency}.pdf`
        );
        await generatePDF(htmlTemplate, pdfFilePath);

        const docxFilePath = path.join(
          outputDir,
          `${invoice.counterparty}_${invoice.amount} ${invoice.currency}.docx`
        );
        // Использование ConvertAPI для конвертации PDF в DOCX
        await convertapi
          .convert("docx", { File: pdfFilePath }, "pdf")
          .then((result: any) => result.saveFiles(outputDir));

        // Переименование файла
        const convertedFilePath = path.join(
          outputDir,
          `${path.basename(pdfFilePath, ".pdf")}.docx`
        );
        const relativeDocxFilePath = path.relative(
          path.join(__dirname, "../../"),
          docxFilePath
        );
        invoice.pathFile = relativeDocxFilePath.replace(/\\/g, "\\");
        console.log(invoice);
        await addInvoice(invoice);
        if (fs.existsSync(convertedFilePath)) {
          fs.renameSync(convertedFilePath, docxFilePath);
        }

        fs.unlinkSync(pdfFilePath);
      }

      res.json({ message: "Invoices processed successfully" });
    } catch (error) {
      console.error("Error processing file:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

export default router;
