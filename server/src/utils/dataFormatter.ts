import { OurCompany, getOurCompanyByName } from "../services/ourCompanyService";

interface ExcelData {
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
  invoiceNumber: string;
  amount: string;
  currency: string;
  invoiceDate: string;
  description: string;
}

export interface Supplier {
  name: string;
  address: string;
  swift: string;
  bankAccountNumber: string;
}

export interface Customer {
  name: string;
  address: string;
  tin: string;
  swift: string;
  iban: string;
  bankName: string;
}

export interface Invoice {
  principal: string;
  rsNumber: string;
  invoiceNumber: string;
  amount: string;
  currency: string;
  invoiceDate: string;
  description: string;
}

export const createSupplierObject = (data: ExcelData): Supplier => {
  return {
    name: data.counterparty,
    address: data.address,
    swift: data.swift,
    bankAccountNumber: data.iban || data.bankAccount,
  };
};

export const createInvoiceObject = (data: ExcelData): Invoice => {
  return {
    principal: data.principal,
    rsNumber: data.rsNumber,
    invoiceNumber: data.invoiceNumber,
    amount: data.amount,
    currency: data.currency,
    invoiceDate: data.invoiceDate,
    description: data.description,
  };
};

export const createCustomerObject = async (
  companyName: string
): Promise<OurCompany | null> => {
  return await getOurCompanyByName(companyName);
};
