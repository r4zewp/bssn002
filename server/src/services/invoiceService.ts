import pool from "../config/configDatabase";

export interface Invoice {
  id?: number;
  created_at?: Date;
  ourCompany: string;
  principal: string;
  rsNumber: string;
  counterparty: string;
  country: string;
  address: string;
  bankAccount: string;
  swift: string;
  amount: string;
  currency: string;
  invoiceDate: string;
  description: string;
  bankName: string;
  iban: string;
  tin: string;
  invoiceNumber: string;
  pathFile?: string;
}

interface InvoiceSearch {
  invoiceNumber: string;
  amount: string;
  counterparty: string;
  rsNumber: string;
}

export const addInvoice = async (invoice: Invoice): Promise<void> => {
  const client = await pool.connect();
  try {
    // Check if an invoice with the same invoice number, amount, counterparty, and RS_number already exists
    const checkRes = await client.query(
      `SELECT id FROM "Document generator".invoice WHERE invoice_number = $1 AND amount = $2 AND counterparty = $3 AND rs_number = $4`,
      [
        invoice.invoiceNumber,
        invoice.amount,
        invoice.counterparty,
        invoice.rsNumber,
      ]
    );

    if (checkRes.rows.length > 0) {
      console.log(
        `Invoice ${invoice.invoiceNumber} already exists. Skipping addition.`
      );
      return;
    }

    await client.query(
      `INSERT INTO "Document generator".invoice (
        created_at, our_company, principal, rs_number, counterparty, country, address, bank_account, 
        swift, amount, currency, invoice_date, description, bank_name, iban, tin, invoice_number, path_file
      ) VALUES (now(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
      [
        invoice.ourCompany,
        invoice.principal,
        invoice.rsNumber,
        invoice.counterparty,
        invoice.country,
        invoice.address,
        invoice.bankAccount,
        invoice.swift,
        invoice.amount,
        invoice.currency,
        invoice.invoiceDate,
        invoice.description,
        invoice.bankName,
        invoice.iban,
        invoice.tin,
        invoice.invoiceNumber,
        invoice.pathFile,
      ]
    );
    console.log(`Invoice ${invoice.invoiceNumber} added.`);
  } catch (error) {
    console.error("Error adding invoice:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const checkInvoiceExists = async (
  invoice: InvoiceSearch
): Promise<boolean> => {
  const client = await pool.connect();
  try {
    const checkRes = await client.query(
      `SELECT id FROM "Document generator".invoice WHERE invoice_number = $1 AND amount = $2 AND counterparty = $3 AND rs_number = $4`,
      [
        invoice.invoiceNumber,
        invoice.amount,
        invoice.counterparty,
        invoice.rsNumber,
      ]
    );
    return checkRes.rows.length > 0;
  } catch (error) {
    console.error("Error checking invoice existence:", error);
    throw error;
  } finally {
    client.release();
  }
};
