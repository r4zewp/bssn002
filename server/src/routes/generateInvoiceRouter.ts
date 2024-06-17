import { Router, Request, Response } from "express";
import { validateApiKey } from "../middlewares/validateApiKey";
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
import ConvertAPI from "convertapi"; // Импорт ConvertAPI
import {
  Invoice,
  addInvoice,
  checkInvoiceExists,
} from "../services/invoiceService";
import { config } from "dotenv";

const environment = process.env.ENVIRONMENT || "dev";
const envFile = environment === "dev" ? ".env.dev" : ".env.prod";

config({ path: envFile });

const convertapi = new ConvertAPI(process.env.CONVERTER_API_KEY!);
console.log(process.env.CONVERTER_API_KEY);
const router = Router();

router.post(
  "/generate-invoice",
  validateApiKey,
  async (req: Request, res: Response) => {
    const { uuid, invoiceData } = req.body;

    if (!invoiceData) {
      return res.status(400).send("Invoice data is required.");
    }

    if (!uuid) {
      return res.status(400).send("UUID is required.");
    }

    try {
      const customer = await getOurCompanyByName(invoiceData.ourCompany);
      if (!customer) {
        throw new Error(`Our company ${invoiceData.ourCompany} not found`);
      }

      const supplier: Counterparty = {
        name: invoiceData.counterparty,
        address: invoiceData.address,
        swift: invoiceData.swift,
        bankAccountNumber: invoiceData.iban || invoiceData.bankAccount,
      };

      await addOrUpdateCounterparty(supplier);

      const invoice: Invoice = {
        ourCompany: invoiceData.ourCompany,
        principal: invoiceData.principal,
        rsNumber: invoiceData.rsNumber,
        counterparty: invoiceData.counterparty,
        country: invoiceData.country,
        address: invoiceData.address,
        iban: invoiceData.iban,
        tin: invoiceData.tin,
        bankAccount: invoiceData.bankAccount,
        swift: invoiceData.swift,
        invoiceNumber: invoiceData.invoiceNumber,
        amount: invoiceData.amount,
        currency: invoiceData.currency,
        bankName: invoiceData.bankName,
        invoiceDate: invoiceData.invoiceDate,
        description: invoiceData.description,
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
        return res.status(409).json({
          message: `Invoice ${invoice.invoiceNumber} already exists. Skipping generation.`,
        });
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

      res.json({
        message: "Invoice processed successfully",
        pathFile: invoice.pathFile,
      });
    } catch (error) {
      console.error("Error processing invoice:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

export default router;
