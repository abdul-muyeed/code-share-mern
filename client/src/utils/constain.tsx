// ...existing code...
type Env = {
  VITE_ENV?: "dev" | "prod";
  VITE_API_BASE_URL?: string;
};

const env = import.meta.env as unknown as Env;

class ConstainClass {
  readonly VITE_ENV: string;
  readonly VITE_API_BASE_URL?: string;

  constructor() {
    this.VITE_ENV = env.VITE_ENV || "dev";
    this.VITE_API_BASE_URL = this.VITE_ENV === "prod" ? env.VITE_API_BASE_URL : "http://localhost:3000/api";
  }
}

export const Constains = Object.freeze(new ConstainClass());