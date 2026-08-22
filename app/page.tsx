import { ArenaPreview } from "./arena/arena-preview";
import { PageHeader, StatusBadge } from "./design-system/components";

export default function Home() {
  return (
    <div className="page page-arena">
      <PageHeader
        eyebrow="Arena"
        title="Find the answer you would actually ship."
        description="Send one prompt to up to three free tier models. Compare blind responses, inspect real measurements, then vote on substance instead of reputation."
        action={<StatusBadge tone="live">Interface preview</StatusBadge>}
      />
      <ArenaPreview />
    </div>
  );
}
