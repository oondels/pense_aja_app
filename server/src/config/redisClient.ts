// src/services/redisService.ts
import { createClient } from "redis";

const redis = createClient({
  url: "redis://localhost:6379",
});

redis.on("error", (err) => console.error("Redis Client Error", err));
redis.on("connect", () => {
  console.log("Redis client connected");
});

async function connectRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }
}
connectRedis()

export default redis;
