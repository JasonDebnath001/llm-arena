import type { Metadata } from "next";
import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { HistoryList } from "@/features/history/history-view";
import { loadHistoryPage } from "@/features/history/history";
import { EmptyState, PageHeader } from "../design-system/components";

export const metadata: Metadata = { title: "History" };
export const dynamic = "force-dynamic";

function firstQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function pageNumber(value: string | string[] | undefined) {
  value = firstQueryValue(value);
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
}

function HistoryNotice({ notice }: Readonly<{ notice: string | undefined }>) {
  if (notice === "deleted") {
    return (
      <aside className="notice notice-success" role="status">
        <strong>Comparison removed</strong>
        <p>Its private prompt and responses have been permanently erased.</p>
      </aside>
    );
  }
  if (notice === "delete-failed") {
    return (
      <aside className="notice notice-danger" role="alert">
        <strong>Comparison not removed</strong>
        <p>The record was unavailable or no longer belongs to this account.</p>
      </aside>
    );
  }
  return null;
}

export default async function HistoryPage({
  searchParams,
}: PageProps<"/history">) {
  const { userId } = await auth();
  const query = await searchParams;
  const currentPage = pageNumber(query.page);

  return (
    <div className="page page-reading">
      <PageHeader
        eyebrow="Private history"
        title="Your comparisons, kept private."
        description="Revisit retained prompts and responses, or permanently erase records you no longer need."
        action={
          <Link className="button button-primary" href="/">
            Start a comparison
          </Link>
        }
      />
      {!userId ? (
        <EmptyState icon="history" title="Sign in to see your history">
          <p>
            Sign in and vote on a comparison to retain its encrypted prompt and
            responses in your private history.
          </p>
          <SignInButton mode="modal">
            <button className="button button-primary" type="button">
              Sign in to continue
            </button>
          </SignInButton>
        </EmptyState>
      ) : (
        <HistoryContent
          clerkSubject={userId}
          currentPage={currentPage}
          notice={firstQueryValue(query.notice)}
        />
      )}
    </div>
  );
}

async function HistoryContent({
  clerkSubject,
  currentPage,
  notice,
}: Readonly<{
  clerkSubject: string;
  currentPage: number;
  notice: string | undefined;
}>) {
  const history = await loadHistoryPage(clerkSubject, currentPage).catch(
    () => null,
  );

  if (!history) {
    return (
      <EmptyState icon="status" title="History is temporarily unavailable">
        <p>Your retained comparisons are unaffected. Try loading them again.</p>
        <Link className="button button-primary" href="/history">
          Try again
        </Link>
      </EmptyState>
    );
  }

  if (currentPage > history.totalPages) {
    redirect(`/history?page=${history.totalPages}`);
  }

  if (history.totalCount === 0) {
    return (
      <>
        <HistoryNotice notice={notice} />
        <EmptyState icon="history" title="No retained comparisons yet">
          <p>
            Complete a blind comparison and vote to keep it in your private
            history.
          </p>
          <Link className="button button-primary" href="/">
            Start a comparison
          </Link>
        </EmptyState>
      </>
    );
  }

  return (
    <>
      <HistoryNotice notice={notice} />
      <HistoryList items={history.items} totalCount={history.totalCount} />
      {history.totalPages > 1 ? (
        <nav className="pagination" aria-label="History pages">
          {currentPage > 1 ? (
            <Link
              className="button button-secondary"
              href={`/history?page=${currentPage - 1}`}
            >
              Previous
            </Link>
          ) : (
            <span />
          )}
          <span>
            Page {currentPage} of {history.totalPages}
          </span>
          {currentPage < history.totalPages ? (
            <Link
              className="button button-secondary"
              href={`/history?page=${currentPage + 1}`}
            >
              Next
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </>
  );
}
