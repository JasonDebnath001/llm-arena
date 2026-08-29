"use client";

import { useId, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Icon } from "@/app/design-system/icons";
import { deleteHistoryComparison } from "./actions";

function DeleteSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="button button-danger" type="submit" disabled={pending}>
      <Icon name="trash" />
      {pending ? "Removing..." : "Remove comparison"}
    </button>
  );
}

export function HistoryDeleteDialog({
  comparisonId,
  promptPreview,
}: Readonly<{ comparisonId: string; promptPreview: string }>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  return (
    <>
      <button
        className="button button-quiet button-delete"
        type="button"
        onClick={() => dialogRef.current?.showModal()}
      >
        <Icon name="trash" />
        Remove
      </button>
      <dialog
        className="confirmation-dialog"
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <form action={deleteHistoryComparison}>
          <input type="hidden" name="comparisonId" value={comparisonId} />
          <span className="dialog-icon" aria-hidden="true">
            <Icon name="trash" />
          </span>
          <h2 id={titleId}>Remove this comparison?</h2>
          <p id={descriptionId}>
            Its prompt and responses will be permanently erased from your
            history. The anonymous vote will remain in aggregate rankings.
          </p>
          <blockquote>{promptPreview}</blockquote>
          <div className="dialog-actions">
            <button
              className="button button-secondary"
              type="button"
              onClick={() => dialogRef.current?.close()}
            >
              Cancel
            </button>
            <DeleteSubmitButton />
          </div>
        </form>
      </dialog>
    </>
  );
}
