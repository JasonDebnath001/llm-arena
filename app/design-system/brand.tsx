import Link from "next/link";

export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="LLM Arena home">
      <span className="brand-mark" aria-hidden="true">
        <span>A</span>
        <span>B</span>
        <span>C</span>
      </span>
      <span className="brand-name">
        LLM <strong>Arena</strong>
      </span>
    </Link>
  );
}
