import redisClient from "../config/redisClient"

const isTokenBlackListed = async (token: string) => {
  const exists = await redisClient.exists(`bl_${token}`);
  return exists === 1;
};

export { isTokenBlackListed };
