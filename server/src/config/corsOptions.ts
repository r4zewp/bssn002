import { CorsOptions } from "cors";

export const corsOptions: CorsOptions = {
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5500",
    "https://iyw5onqr5kzce.elma365.ru",
  ],
  optionsSuccessStatus: 200,
};
