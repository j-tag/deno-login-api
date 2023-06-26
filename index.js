import {Application, Router} from "https://deno.land/x/oak/mod.ts";

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

await app.listen({port: 8000})
