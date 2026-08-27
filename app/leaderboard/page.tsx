import type { Metadata } from "next";
import {
  buildLeaderboard,
  formatInteger,
} from "@/features/leaderboard/leaderboard";
import {
  LeaderboardUnavailable,
  LeaderboardView,
} from "@/features/leaderboard/leaderboard-view";
import { getLeaderboardEvidence } from "@/infrastructure/database/leaderboard";
import { PageHeader, StatusBadge } from "../design-system/components";

export const metadata: Metadata = { title: "Leaderboard" };
export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const evidence = await getLeaderboardEvidence().catch(() => null);
  const leaderboard = evidence ? buildLeaderboard(evidence) : null;

  return (
    <div className="page page-reading">
      <PageHeader
        eyebrow="Leaderboard"
        title="Quality, with the receipts."
        description="Rankings combine blind votes with real call measurements. Sample size stays visible so an early lead never looks more certain than it is."
        action={
          leaderboard ? (
            <StatusBadge tone="success">
              {formatInteger(leaderboard.totalVerifiedVotes)} verified{" "}
              {leaderboard.totalVerifiedVotes === 1 ? "vote" : "votes"}
            </StatusBadge>
          ) : (
            <StatusBadge tone="danger">Data unavailable</StatusBadge>
          )
        }
      />
      {leaderboard ? (
        <LeaderboardView leaderboard={leaderboard} />
      ) : (
        <LeaderboardUnavailable />
      )}
    </div>
  );
}
