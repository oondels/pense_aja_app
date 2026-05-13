import redisClient from "../config/redisClient"

const isTokenBlackListed = async (token: string): Promise<boolean> => {
  try {
    const exists = await redisClient.exists(`bl_${token}`);
    return exists === 1;
  } catch (err) {
    console.warn("[token-blacklist] Redis indisponível — blacklist ignorada:", err);
    return false;
  }
};

export { isTokenBlackListed };
