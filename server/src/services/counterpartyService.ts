import pool from "../config/configDatabase";
import { addTemplate } from "./templateService";

export interface Counterparty {
  id?: number;
  name: string;
  address: string;
  swift: string;
  bankAccountNumber: string;
}

export const getCounterparties = async (): Promise<Counterparty[]> => {
  const client = await pool.connect();
  try {
    const res = await client.query(
      'SELECT * FROM "Document generator".counterparties'
    );
    return res.rows;
  } catch (error) {
    console.error("Error getting counterparties:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const getCounterpartyByName = async (
  name: string
): Promise<Counterparty | null> => {
  const client = await pool.connect();
  try {
    const res = await client.query(
      'SELECT * FROM "Document generator".counterparties WHERE LOWER(name) = LOWER($1)',
      [name]
    );
    if (res.rows.length > 0) {
      return res.rows[0];
    }
    return null;
  } catch (error) {
    console.error("Error getting counterparty by name:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const getCounterpartyById = async (
  id: number
): Promise<Counterparty | null> => {
  const client = await pool.connect();
  try {
    const res = await client.query(
      'SELECT * FROM "Document generator".counterparties WHERE id = $1',
      [id]
    );
    if (res.rows.length > 0) {
      return res.rows[0];
    }
    return null;
  } catch (error) {
    console.error("Error getting counterparty by ID:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const addOrUpdateCounterparty = async (
  counterparty: Counterparty
): Promise<void> => {
  const client = await pool.connect();
  try {
    // Проверяем, существует ли контрагент с таким же именем
    const checkRes = await client.query(
      `SELECT id FROM "Document generator".counterparties WHERE name = $1`,
      [counterparty.name]
    );

    if (checkRes.rows.length > 0) {
      // Если контрагент существует, обновляем его
      const existingCounterpartyId = checkRes.rows[0].id;
      await client.query(
        `UPDATE "Document generator".counterparties
         SET address = $1, swift = $2, bank_account_number = $3
         WHERE id = $4`,
        [
          counterparty.address,
          counterparty.swift,
          counterparty.bankAccountNumber,
          existingCounterpartyId,
        ]
      );
      console.log(`Counterparty ${counterparty.name} updated.`);
    } else {
      // Если контрагента не существует, добавляем нового
      const insertRes = await client.query(
        `INSERT INTO "Document generator".counterparties (name, address, swift, bank_account_number)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [
          counterparty.name,
          counterparty.address,
          counterparty.swift,
          counterparty.bankAccountNumber,
        ]
      );

      const newCounterpartyId = insertRes.rows[0].id;
      await addTemplate(newCounterpartyId);
      console.log(
        `New counterparty ${counterparty.name} added with template generated.`
      );
    }
  } catch (error) {
    console.error("Error adding or updating counterparty:", error);
    throw error;
  } finally {
    client.release();
  }
};
