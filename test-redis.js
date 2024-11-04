import { createClient } from "redis";

const client = createClient({
    url: "redis://127.0.0.1:6379"
})

client.on("error", (err) => {
    console.log(err);
});

client.on("ready", () => {
    console.log("success");
});

async function redisTest(client)
{
    await client.connect();
    await client.set("test_redis", "data");
    const data = await client.get("test_redis");
    client.quit();
}

redisTest(client);