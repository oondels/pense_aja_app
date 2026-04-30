declare global {
  namespace Express {
    interface Request {
      user?: import("../middlewares/auth").DecodedToken;
      authContext?: import("../types/contracts").AuthenticatedSessionContext;
    }
  }
}

export {}; // Garante que o arquivo seja tratado como módulo e que a declaração global seja aplicada
