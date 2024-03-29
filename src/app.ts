import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { connectDB } from "./database";
import taskRoutes from "./routes/Task";
import userRoutes from "./routes/User";
import testRoutes from "./routes/Test";


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const port = process.env.PORT || 3000;

connectDB();

app.use("/", testRoutes);
app.use("/api", taskRoutes);
app.use("/api", userRoutes);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
