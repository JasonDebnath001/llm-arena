import { ArenaPreview } from "./arena/arena-preview";
import { listPickerModels } from "./arena/model-catalog";
import { PageHeader, StatusBadge } from "./design-system/components";

export const dynamic = "force-dynamic";

export default async function Home() {
  let catalogError = false;
  const models = await listPickerModels().catch(() => {
    catalogError = true;
    return [];
  });

  return (
    <div className="page page-arena">
      <PageHeader
        eyebrow="Arena"
        title="Find the answer you would actually ship."
        description="Send one prompt to up to three free tier models. Compare blind responses, inspect real measurements, then vote on substance instead of reputation."
        action={<StatusBadge tone="live">Interface preview</StatusBadge>}
      />
      <ArenaPreview catalogError={catalogError} models={models} />
    </div>
  );
}
