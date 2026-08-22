import "server-only";

function requireEnvironmentVariable(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

export const serverEnvironment = Object.freeze({
  get arcjetKey() {
    return requireEnvironmentVariable("ARCJET_KEY", process.env.ARCJET_KEY);
  },
  get databaseUrl() {
    return requireEnvironmentVariable("DATABASE_URL", process.env.DATABASE_URL);
  },
  get nodeEnvironment() {
    return process.env.NODE_ENV;
  },
  get postHogHost() {
    return process.env.NEXT_PUBLIC_POSTHOG_HOST;
  },
  get postHogProjectToken() {
    return process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  },
});
