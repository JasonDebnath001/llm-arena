import type { Metadata } from "next";
import { PageHeader, StatusBadge } from "../design-system/components";

export const metadata: Metadata = { title: "Leaderboard" };

const rankings = [
  {
    rank: "01",
    model: "Qwen3 32B",
    record: "68%",
    votes: "142",
    latency: "720 ms",
  },
  {
    rank: "02",
    model: "Llama 3.3 70B",
    record: "61%",
    votes: "118",
    latency: "860 ms",
  },
  {
    rank: "03",
    model: "Gemma 3 27B",
    record: "54%",
    votes: "97",
    latency: "640 ms",
  },
] as const;

export default function LeaderboardPage() {
  return (
    <div className="page page-reading">
      <PageHeader
        eyebrow="Leaderboard"
        title="Quality, with the receipts."
        description="Rankings combine blind votes with real call measurements. Sample size stays visible so an early lead never looks more certain than it is."
        action={<StatusBadge tone="success">257 verified votes</StatusBadge>}
      />
      <aside className="notice notice-warning">
        <strong>Early alpha data</strong>
        <p>
          Models need at least 25 completed votes to rank. Treat close results
          as directional.
        </p>
      </aside>
      <section className="data-panel" aria-labelledby="ranking-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Overall ranking</p>
            <h2 id="ranking-title">Eligible free tier models</h2>
          </div>
          <button className="button button-secondary" type="button">
            How ranking works
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Rank</th>
                <th scope="col">Model</th>
                <th scope="col">Win record</th>
                <th scope="col">Votes</th>
                <th scope="col">Median latency</th>
                <th scope="col">Cost</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((row) => (
                <tr key={row.rank}>
                  <td data-label="Rank">
                    <span className="rank">{row.rank}</span>
                  </td>
                  <th scope="row" data-label="Model">
                    {row.model}
                    <small>Available · Free tier</small>
                  </th>
                  <td data-label="Win record">
                    <strong>{row.record}</strong>
                  </td>
                  <td data-label="Votes">{row.votes}</td>
                  <td data-label="Median latency">{row.latency}</td>
                  <td data-label="Cost">$0.0000</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
