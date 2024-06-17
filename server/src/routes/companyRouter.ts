import { Router, Request, Response } from "express";
import { validateApiKey } from "../middlewares/validateApiKey";
import {
  addOrUpdateOurCompany,
  OurCompany,
} from "../services/ourCompanyService";

const router = Router();

router.post(
  "/add-company",
  validateApiKey,
  async (req: Request, res: Response) => {
    console.log(req);
    const {
      name,
      address,
      bank_name,
      bank_address,
      tax_id,
      swift,
      account_number,
    } = req.body;

    if (
      !name ||
      !address ||
      !bank_name ||
      !tax_id ||
      !swift ||
      !account_number
    ) {
      return res.status(400).send("Все поля обязательны.");
    }

    const company: OurCompany = {
      name,
      address,
      bank_name,
      bank_address,
      tax_id,
      swift,
      account_number,
    };

    try {
      await addOrUpdateOurCompany(company);
      res.json({ message: "Компания успешно добавлена или обновлена." });
    } catch (error) {
      console.error("Ошибка при добавлении или обновлении компании:", error);
      res.status(500).send("Внутренняя ошибка сервера");
    }
  }
);

export default router;
