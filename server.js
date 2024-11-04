import express from "express";
import exphbs from "express-handlebars";
import "dotenv/config";
import * as path from "node:path";
import cookieParser from "cookie-parser";
import session from "express-session";
import siteRoutes from "./src/routes/site-routes.js";
import userRoutes from "./src/routes/user-routes.js";
import {checkUser} from "./src/middlewares/user-middleware.js";
import RedisStore from "connect-redis";
import {createClient} from "redis";

const PORT = process.env.PORT || 3000;

const hbs = exphbs.create({
    defaultLayout: "main",
    extname: "hbs",
});

const client = createClient({
    url: "redis://127.0.0.1:6379"
});

async function run (client) {
    await client.connect();
}

client.on("ready", () => {
    const redisStore = new RedisStore({
        client: client,
        ttl: 86400
    });

    const app = express();

    app.use(express.static("photos"));

    app.use(cookieParser());

    app.use(session({
        store: redisStore,
        secret: process.env.SESSION_KEY,
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 1000 * 60 * 60 },
    }));

    app.use(checkUser);
    app.use(express.static("public"));
    app.engine("hbs", hbs.engine);
    app.set("view engine", "hbs");
    app.set("views", path.join("src", "views"));

    app.use(express.urlencoded({extended: true}));
    app.use(siteRoutes);
    app.use("/user", userRoutes);

    app.listen(PORT, () =>
        console.log(`Server is running http://localhost:${PORT}`)
    );

    app.use('/photos', express.static(path.join(import.meta.dirname, 'photos')));
});

run(client);