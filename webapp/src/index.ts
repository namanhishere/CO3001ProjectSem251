import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
dotenv.config();
import * as authFunc from "./function/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("views", path.resolve("views"));
app.set("view engine", "ejs");
app.use(express.static(path.resolve("public")));


// Notification 
import * as notisys from "./function/Notification.js";
notisys.NotificationListener.getInstance().registerChannel(new notisys.EmailNotificationChannel());
notisys.NotificationListener.getInstance().registerChannel(new notisys.FirebaseInappNotificationChannel());


// app.get("/", (req, res) );
app.get("/", authFunc.authMiddlewareWeb, (req, res) => {
    res.render("prelogin");
});

app.use((req, res, next) => {
    res.status(404).render("error", { message: "Page not found" });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).render("error", { message: "Internal Server Error" });
});

app.listen(3001, () => console.log("Server running on port 3001"));