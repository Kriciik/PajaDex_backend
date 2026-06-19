import express from "express";
import routes from "./routes/index.routes";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();
const PORT = process.env.PORT!;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api", routes);
app.use(errorHandler);
app.listen(PORT, (err) => {
  if (err) {
    console.error("Error starting server:", err);
  } else {
    console.log(`Server is running on port localhost:${PORT}`);
  }
});
