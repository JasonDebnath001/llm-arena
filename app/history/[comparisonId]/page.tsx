import type { Metadata } from "next";
import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState, PageHeader } from "@/app/design-system/components";
import { Icon } from "@/app/design-system/icons";
import { HistoryDeleteDialog } from "@/app/history/history-delete-dialog";
import { loadHistoryDetail } from "@/features/history/history";
import { HistoryDetailView } from "@/features/history/history-view";

export const metadata: Metadata = { title: "Saved comparison" };
export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "long",
  timeStyle: "short",
});

export default async function HistoryDetailPage({
  params,
}: PageProps<"/history/[comparisonId]">) {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="page page-reading">
        <PageHeader
          eyebrow="Private history"
          title="Sign in to open this comparison."
          description="Saved prompts and responses are available only to the account that retained them."
        />
        <EmptyState icon="history" title="Authentication required">
          <p>Sign in with the account that owns this comparison.</p>
          <SignInButton mode="modal">
            <button className="button button-primary" type="button">
              Sign in to continue
            </button>
          </SignInButton>
        </EmptyState>
      </div>
    );
  }

  const { comparisonId } = await params;
  const comparison = await loadHistoryDetail(userId, comparisonId).catch(
    () => undefined,
  );

  if (comparison === undefined) {
    return (
      <div className="page page-reading">
        <Link className="back-link" href="/history">
          <Icon name="arrowLeft" />
          Back to history
        </Link>
        <PageHeader
          eyebrow="Saved comparison"
          title="This comparison is temporarily unavailable."
          description="Your retained comparison is unaffected. Try loading it again."
        />
        <EmptyState icon="status" title="Unable to load comparison">
          <p>The comparison could not be loaded right now.</p>
          <Link
            className="button button-primary"
            href={`/history/${comparisonId}`}
          >
            Try again
          </Link>
        </EmptyState>
      </div>
    );
  }

  if (comparison === null) notFound();

  return (
    <div className="page page-reading">
      <Link className="back-link" href="/history">
        <Icon name="arrowLeft" />
        Back to history
      </Link>
      <PageHeader
        eyebrow="Saved comparison"
        title="A private record of your blind vote."
        description={`Created ${dateFormatter.format(comparison.createdAt)}. Prompt and response content remains encrypted at rest.`}
        action={
          <HistoryDeleteDialog
            comparisonId={comparison.id}
            promptPreview={comparison.prompt}
          />
        }
      />
      <HistoryDetailView comparison={comparison} />
    </div>
  );
}
