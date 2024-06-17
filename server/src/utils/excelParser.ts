import ExcelJS from "exceljs";
import {
  addOrUpdateCounterparty,
  Counterparty,
} from "../services/counterpartyService";
import { addInvoice, Invoice } from "../services/invoiceService";

interface ParsedData {
  ourCompany: string;
  principal: string;
  rsNumber: string;
  counterparty: string;
  country: string;
  address: string;
  iban: string;
  tin: string;
  bankAccount: string;
  swift: string;
  bankName: string;
  invoiceNumber: string;
  amount: string;
  currency: string;
  invoiceDate: string;
  description: string;
}

// Функция для задержки
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const parseExcelFile = async (
  fileBuffer: Buffer
): Promise<ParsedData[]> => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer);

  const worksheet = workbook.worksheets[0];

  // Проверяем заголовки столбцов
  const headers: { [key: string]: string } = {};
  worksheet.getRow(1).eachCell((cell, colNumber) => {
    if (cell.value) {
      headers[colNumber - 1] = cell.value.toString().toLowerCase();
    }
  });

  // Проверяем наличие необходимых столбцов
  const requiredColumns = [
    "our company",
    "principal",
    "rs_number",
    "counterparty",
    "country",
    "address",
    "iban",
    "tin",
    "bank account",
    "swift",
    "invoice number",
    "amount",
    "currency",
    "invoice date",
    "description",
  ];

  for (const column of requiredColumns) {
    if (!Object.values(headers).includes(column)) {
      throw new Error(
        `Invalid file format. Required column: "${column}" not found.`
      );
    }
  }

  const data: ParsedData[] = [];
  for (const row of worksheet.getRows(2, worksheet.rowCount - 1) || []) {
    // Задержка 0.5 секунды в начале каждой итерации
    await delay(500);

    const rowData: any = {};
    let isEmptyRow = true;
    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber - 1];
      if (header) {
        rowData[header] = cell.value || "";
        if (cell.value) {
          isEmptyRow = false; // Если хотя бы одна ячейка не пуста, строка не считается пустой
        }
      }
    });

    // Если строка пустая, выходим из цикла
    if (isEmptyRow) {
      break;
    }

    const counterparty: Counterparty = {
      name: rowData["counterparty"],
      address: rowData["address"],
      swift: rowData["swift"],
      bankAccountNumber: rowData["iban"] || rowData["bank account"],
    };
    await addOrUpdateCounterparty(counterparty);

    const invoice: Invoice = {
      ourCompany: rowData["our company"],
      principal: rowData["principal"],
      rsNumber: rowData["rs_number"],
      counterparty: rowData["counterparty"],
      country: rowData["country"],
      address: rowData["address"],
      iban: rowData["iban"],
      tin: rowData["tin"],
      bankAccount: rowData["bank account"],
      swift: rowData["swift"],
      invoiceNumber: rowData["invoice number"],
      amount: rowData["amount"],
      currency: rowData["currency"],
      invoiceDate: rowData["invoice date"],
      description: rowData["description"],
      bankName: rowData["bank name"],
    };

    data.push(invoice);
  }

  return data;
};
