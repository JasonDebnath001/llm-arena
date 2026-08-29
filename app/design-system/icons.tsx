import type { SVGProps } from "react";

export type IconName =
  | "arrowLeft"
  | "arena"
  | "chevronRight"
  | "history"
  | "leaderboard"
  | "models"
  | "spark"
  | "status"
  | "timer"
  | "tokens"
  | "trash"
  | "user";

type IconProps = Readonly<SVGProps<SVGSVGElement> & { name: IconName }>;

const paths: Readonly<Record<IconName, React.ReactNode>> = {
  arrowLeft: <path d="m15 18-6-6 6-6m-6 6h12" />,
  arena: <path d="M4 18V8m8 10V4m8 14v-7M2 18h20" />,
  chevronRight: <path d="m9 18 6-6-6-6" />,
  history: <path d="M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5m4-1v5l3 2" />,
  leaderboard: <path d="M5 20v-7h4v7m2 0V4h4v16m2 0v-10h4v10M3 20h20" />,
  models: (
    <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Zm-8 9 8 4.5 8-4.5m-16 5 8 4 8-4" />
  ),
  spark: (
    <path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" />
  ),
  status: <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-14v4m0 4h.01" />,
  timer: <path d="M9 2h6m-3 4a8 8 0 1 0 8 8 8 8 0 0 0-8-8Zm0 4v4l3 2" />,
  tokens: (
    <path d="M7 7h10v10H7zM3 10V5a2 2 0 0 1 2-2h5m4 18h5a2 2 0 0 0 2-2v-5" />
  ),
  trash: <path d="M4 7h16m-10 4v6m4-6v6M9 7l1-3h4l1 3m3 0-1 14H7L6 7" />,
  user: <path d="M20 21a8 8 0 0 0-16 0m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />,
};

export function Icon({ name, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      viewBox="0 0 24 24"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
