import { PostHog } from "posthog-node";

import { serverEnvironment } from "@/infrastructure/env";

let posthogClient: PostHog | null = null;

export function getPostHogClient(): PostHog | null {
  const token = serverEnvironment.postHogProjectToken;
  const host = serverEnvironment.postHogHost;

  if (!token) {
    if (serverEnvironment.nodeEnvironment === "development") {
      console.error(
        "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, " +
          "this causes events to be silently missed. " +
          "This error stops appearing once NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is configured",
      );
    }
    return null;
  }

  if (!posthogClient) {
    posthogClient = new PostHog(token, {
      host,
      flushAt: 1,
      flushInterval: 0,
    });
  }

  return posthogClient;
}

export async function shutdownPostHog() {
  if (posthogClient) {
    await posthogClient.shutdown();
    posthogClient = null;
  }
}
