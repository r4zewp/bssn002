import fs from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";
import { TemplateData } from "./templateService";
import pool from "../config/configDatabase";
import { Customer, Invoice, Supplier } from "../utils/dataFormatter";
import { OurCompany } from "./ourCompanyService";
async function loadTemplatePart(filePath: string): Promise<string> {
  try {
    const absolutePath = path.resolve(__dirname, "../../templates", filePath);
    const module = await import(absolutePath);
    return module.default || module;
  } catch (error) {
    console.error(`Error loading template part from ${filePath}:`, error);
    throw error;
  }
}

async function getCompanyDataByName(companyName: string) {
  const query =
    'SELECT * FROM "Document generator".our_companies WHERE name = $1';
  const values = [companyName];

  try {
    const res = await pool.query(query, values);
    if (res.rows.length === 0) {
      throw new Error(`No company found with the name: ${companyName}`);
    }
    return res.rows[0];
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  }
}

export async function generateInvoiceTemplate(
  templateData: TemplateData,
  invoice: Invoice,
  supplier: Supplier,
  customer: OurCompany
): Promise<string> {
  const headerData = {
    companyName: customer.name,
    invoiceNumber: invoice.invoiceNumber,
  };

  const footerData = {
    description: invoice.description,
    amount: invoice.amount,
    currency: invoice.currency,
    totalAmount: invoice.amount,
  };

  const headerTemplateModule = await loadTemplatePart(
    templateData.attributeheaderpath
  );
  const bodyTemplateModule = await loadTemplatePart(
    templateData.attributebodypath
  );
  const footerTemplateModule = await loadTemplatePart(
    templateData.attributefooterpath
  );
  const hasFrameModule = await loadTemplatePart(templateData.hasframepath);
  const headerFontColorModule = await loadTemplatePart(
    templateData.headerfontcolourpath
  );
  const detailsAlignmentModule = await loadTemplatePart(
    templateData.bodyalignmentpath
  );
  const bodyFillColourModule = await loadTemplatePart(
    templateData.bodyfillcolourpath
  );
  const footerFontModule = await loadTemplatePart(templateData.footerfontpath);
  const footerAlignmentModule = await loadTemplatePart(
    templateData.footeralignmentpath
  );

  //@ts-ignore
  const invoiceHeader = headerTemplateModule.invoiceHeader;
  //@ts-ignore
  const invoiceBody = bodyTemplateModule.invoiceBody;
  //@ts-ignore
  const invoiceFooter = footerTemplateModule.invoiceFooter;
  //@ts-ignore
  const hasFrame = hasFrameModule.hasFrame;
  //@ts-ignore
  const headerFontColor = headerFontColorModule.headerFontColor;
  //@ts-ignore
  const detailsAlignment = detailsAlignmentModule.bodyAlignment;
  //@ts-ignore
  const bodyFillColor = bodyFillColourModule.bodyFillColour;
  //@ts-ignore
  const footerFontFamily = footerFontModule.footerFont;
  //@ts-ignore
  const footerAlignment = footerAlignmentModule.footerAlignment;

  const headerHtml = invoiceHeader(headerData);
  const bodyHtml = invoiceBody(supplier, customer);
  const footerHtml = invoiceFooter(footerData);
  const frameStyles = hasFrame();
  const headerFontColorStyles = headerFontColor();
  const detailsAlignmentText = detailsAlignment();
  const bodyFillColorText = bodyFillColor();
  const footerFontFamilyText = footerFontFamily();
  const footerAlignmentText = footerAlignment();

  const html = `
      <html lang="en">
      <head>  
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Invoice</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding-top: 50px;
                  padding-bottom: 50px;
                  ${bodyFillColorText}
                  box-sizing: border-box;
              }
              .container {
                  width: 80%;
                  margin-left: 120px;
                  ${frameStyles}
              }
              .header {
                  ${headerFontColorStyles}
              }
              .header p {
                  margin: 0;
              }
              .invoice-details {
                  text-align: right;
                  margin-bottom: 20px;
              }
              .details {
                  ${detailsAlignmentText}
              }
              .details div {
                  width: 48%;
              }
              .footer {
                  margin-left: 10px;
                  margin-right: 10px;
                  ${footerAlignmentText}
                  ${footerFontFamilyText}
              }
          </style>
      </head>
      <body>
          <div class="container">
              ${headerHtml}
              ${bodyHtml}
              ${footerHtml}
          </div>
      </body>
      </html>
  `;
  return html;
}

export const generatePDF = async (html: string, outputPath: string) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(html);
  await page.pdf({ path: outputPath, format: "A4", printBackground: true });
  await browser.close();
};
