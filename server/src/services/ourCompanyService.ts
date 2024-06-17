import pool from "../config/configDatabase";

export interface OurCompany {
  id?: number;
  name: string;
  address: string;
  bank_name: string;
  bank_address: string;
  tax_id: string;
  swift: string;
  account_number: string;
}

export const getOurCompanies = async (): Promise<OurCompany[]> => {
  const client = await pool.connect();
  try {
    const res = await client.query(
      'SELECT * FROM "Document generator".our_companies'
    );
    return res.rows;
  } catch (error) {
    console.error("Error getting our companies:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const getOurCompanyByName = async (
  name: string
): Promise<OurCompany | null> => {
  const client = await pool.connect();
  try {
    const res = await client.query(
      'SELECT * FROM "Document generator".our_companies WHERE name = $1',
      [name]
    );
    if (res.rows.length > 0) {
      return res.rows[0];
    }
    return null;
  } catch (error) {
    console.error("Error getting our company by name:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const getOurCompanyById = async (
  id: number
): Promise<OurCompany | null> => {
  const client = await pool.connect();
  try {
    const res = await client.query(
      'SELECT * FROM "Document generator".our_companies WHERE id = $1',
      [id]
    );
    if (res.rows.length > 0) {
      return res.rows[0];
    }
    return null;
  } catch (error) {
    console.error("Error getting our company by ID:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const addOrUpdateOurCompany = async (
  company: OurCompany
): Promise<void> => {
  const client = await pool.connect();
  try {
    // Проверяем, существует ли компания с таким же именем
    const checkRes = await client.query(
      `SELECT id FROM "Document generator".our_companies WHERE name = $1`,
      [company.name]
    );

    if (checkRes.rows.length > 0) {
      // Если компания существует, обновляем её
      const existingCompanyId = checkRes.rows[0].id;
      await client.query(
        `UPDATE "Document generator".our_companies
         SET address = $1, bank_name = $2, bank_address = $3, tax_id = $4, swift = $5, account_number = $6
         WHERE id = $7`,
        [
          company.address,
          company.bank_name,
          company.bank_address,
          company.tax_id,
          company.swift,
          company.account_number,
          existingCompanyId,
        ]
      );
      console.log(`Company ${company.name} updated.`);
    } else {
      // Если компании не существует, добавляем новую
      await client.query(
        `INSERT INTO "Document generator".our_companies (name, address, bank_name, bank_address, tax_id, swift, account_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          company.name,
          company.address,
          company.bank_name,
          company.bank_address,
          company.tax_id,
          company.swift,
          company.account_number,
        ]
      );
      console.log("New company added.");
    }
  } catch (error) {
    console.error("Error adding or updating our company:", error);
    throw error;
  } finally {
    client.release();
  }
};
