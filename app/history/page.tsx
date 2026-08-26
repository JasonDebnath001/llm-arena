import type { Metadata } from "next";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { EmptyState, PageHeader } from "../design-system/components";

export const metadata: Metadata = { title: "History" };

export default function HistoryPage() {
  return (
    <div className="page page-reading">
      <PageHeader
        eyebrow="Private history"
        title="Your comparisons, kept private."
        description="Reopen retained prompts, finish comparisons, or remove records you no longer need."
        action={
          <button className="button button-secondary" type="button">
            Privacy controls
          </button>
        }
      />
      <Show when="signed-out">
        <EmptyState icon="history" title="Sign in to see your history">
          <p>
            Your anonymous comparisons stay on this device. Sign in when you are
            ready to vote and retain private records.
          </p>
          <SignInButton mode="modal">
            <button className="button button-primary" type="button">
              Sign in to continue
            </button>
          </SignInButton>
        </EmptyState>
      </Show>
      <Show when="signed-in">
        <EmptyState icon="history" title="No retained comparisons yet">
          <p>Your completed comparisons will appear here.</p>
          <UserButton showName />
        </EmptyState>
      </Show>
    </div>
  );
}
