import {Application, Router} from "https://deno.land/x/oak@v12.5.0/mod.ts";
import { superoak } from "https://deno.land/x/superoak@4.7.0/mod.ts";

const users = [
    {username: "akbar", password: "12345"},
    {username: "asghar", password: "asghar2020"},
]
const router = new Router();
router
    .get("/", (context) => {
        context.response.body = "Welcome to login API server!";
    })
    .post("/login", async (context) => {
        // Extract login details
        const request = context.request.body({type: "json"})
        const json = await request.value // an object of parsed JSON
        const username = json.username
        const password = json.password

        // Find login info in list of users
        if (users.some((u) => u.username === username && u.password === password)) {
            console.log("User found!");
            // Set successful result
            context.response.body = {result: "ok"};
        } else {
            console.log("User not found!");
            // Set failed result
            context.response.body = {result: "failed"};
        }
    })
    .post("/register", async (context) => {
        // Extract new user details
        const request = context.request.body({type: "json"})
        const json = await request.value // an object of parsed JSON
        const username = json.username
        const password = json.password

        // Avoid duplicate user add
        if (users.some((u) => u.username === username)) {
            console.log("Duplicate register!");
            // Set failed result
            context.response.body = {result: "failed"};
        } else {
            // Add user to list of users
            users.push({username, password})
            console.log("New user created!");
            // Set successful result
            context.response.body = {result: "ok"};
        }
    })

const app = new Application()

app.use(router.routes())
app.use(router.allowedMethods())

app.addEventListener("listen", ({hostname, port, secure}) => {
    console.log(
        `Listening on: ${secure ? "https://" : "http://"}${
            hostname ?? "localhost"
        }:${port}`,
    )
})

// If we are not in test mode, run server
if(!Deno.env.get("TESTING")) {
    await app.listen({port: 8000})
}

// Send simple GET request
Deno.test("it should support the Oak framework", async () => {
    const request = await superoak(app);
    await request.get("/").expect("Welcome to login API server!");
});

Deno.test("it should have Akbar user", async () => {
    const request = await superoak(app);
    await request.post("/login")
        .set("Content-Type", "application/json")
        .send('{"username":"akbar", "password": "12345"}')
        .expect('{"result":"ok"}');
});

Deno.test("it should NOT have Hesam user", async () => {
    const request = await superoak(app);
    await request.post("/login")
        .set("Content-Type", "application/json")
        .send('{"username":"hesam", "password": "12345"}')
        .expect('{"result":"failed"}');
});