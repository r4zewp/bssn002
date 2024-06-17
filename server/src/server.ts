import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { corsOptions } from "./config/corsOptions";
import uploadRoute from "./routes/uploadRoute";
import templateUploadRoute from "./routes/templateUploadRoute";
import companyRouter from "./routes/companyRouter";
import path from "path";
import { validateApiKey } from "./middlewares/validateApiKey";
import generateInvoiceRouter from "./routes/generateInvoiceRouter";
dotenv.config();

const app = express();
const port = process.env.PORT || 3003;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

app.use("/api", uploadRoute);
app.use("/api", templateUploadRoute);
app.use("/api", companyRouter);
app.use("/api", generateInvoiceRouter);
// Настройка раздачи статических файлов из папки "output" с проверкой API ключа
app.use(
  "/output",
  validateApiKey,
  express.static(path.join(__dirname, "../output"))
);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
