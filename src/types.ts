export type Env = {
  HANDLES?: KVNamespace;
  APP_NAME?: string;
};

export type HandlesPayload = {
  handles: string[];
  updatedAt?: string;
};
