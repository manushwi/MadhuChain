import Link from "next/link";

export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="HoneyChain home">
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <path d="M20 2 35.6 11v18L20 38 4.4 29V11L20 2Z" />
        <path d="m13 14 7-4 7 4v8l-7 4-7-4v-8Zm0 8v7m14-7v7" />
      </svg>
      <span>HONEY<strong>CHAIN</strong></span>
    </Link>
  );
}
