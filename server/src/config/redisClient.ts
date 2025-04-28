// src/services/redisService.ts
import { createClient } from "redis";
import dotenv from "../config/dotenv";

const redisClient = createClient({
  socket: {
    host: dotenv.REDIS_HOST,
    port: 6379,
  },
  password: dotenv.REDIS_PASS,
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));
redisClient.on("connect", () => {
  console.log("Redis client connected");
});

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}
connectRedis()

export default redisClient;
