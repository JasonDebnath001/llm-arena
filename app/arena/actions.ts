"use server";

import { resolvePickerSelection } from "./model-catalog";

export type PrepareComparisonState = Readonly<{
  message: string;
  status: "error" | "idle" | "success";
}>;

export const initialPrepareComparisonState: PrepareComparisonState = {
  message: "",
  status: "idle",
};

export async function prepareComparison(
  _previousState: PrepareComparisonState,
  formData: FormData,
): Promise<PrepareComparisonState> {
  const modelIds = [
    ...new Set(
      formData
        .getAll("modelIds")
        .filter((value): value is string => typeof value === "string"),
    ),
  ];

  if (modelIds.length < 1 || modelIds.length > 3) {
    return { status: "error", message: "Choose between one and three models." };
  }

  const prompt = formData.get("prompt");
  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    return { status: "error", message: "Enter a prompt to compare." };
  }

  let resolvedModels;
  try {
    resolvedModels = await resolvePickerSelection(modelIds);
  } catch {
    return {
      status: "error",
      message: "Model availability could not be checked. Try again shortly.",
    };
  }
  if (resolvedModels.length !== modelIds.length) {
    return {
      status: "error",
      message:
        "One of those models is no longer available. Review the selection and try again.",
    };
  }

  return {
    status: "success",
    message: `${resolvedModels.length} ${resolvedModels.length === 1 ? "model is" : "models are"} ready for comparison.`,
  };
}
