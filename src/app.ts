import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import notFound from "./middlewares/notFound";
import errorHandler from "./middlewares/errorHandler";
import authorRoutes from "./routes/authorRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import bookRoutes from "./routes/bookRoutes";

const app: Application = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/authors", authorRoutes);
app.use("/categories", categoryRoutes);
app.use("/books", bookRoutes);

app.use(notFound);

app.use(errorHandler);

export default app;
