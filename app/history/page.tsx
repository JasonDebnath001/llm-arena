import type { Metadata } from "next";
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
      <EmptyState icon="history" title="Sign in to see your history">
        <p>
          Your anonymous comparisons stay on this device. Sign in when you are
          ready to vote and retain private records.
        </p>
        <button className="button button-primary" type="button">
          Sign in to continue
        </button>
      </EmptyState>
    </div>
  );
}
