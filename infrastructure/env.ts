import "server-only";

import { databaseEnvironment } from "./database-environment";

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
    return databaseEnvironment.url;
  },
  get contentEncryptionKey() {
    return requireEnvironmentVariable(
      "CONTENT_ENCRYPTION_KEY",
      process.env.CONTENT_ENCRYPTION_KEY,
    );
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
  get openRouterApiKey() {
    return requireEnvironmentVariable(
      "OPENROUTER_API_KEY",
      process.env.OPENROUTER_API_KEY,
    );
  },
});
