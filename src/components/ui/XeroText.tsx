import { Fragment } from "react";

/**
 * Renders `text` with every occurrence of "Xero" in the Xero blue (the `xero` token), leaving the
 * rest of the string in whatever colour the surrounding element sets.
 *
 * Splitting on a capturing group keeps the separators, so this handles the word
 * at any position and any number of times — "Xero Integration FAQ" and
 * "Connect & disconnect to Xero" both come out right.
 */
export function highlightXero(text: string, className = "text-xero") {
  return text.split(/(Xero)/g).map((part, i) =>
    part === "Xero" ? (
      <span key={i} className={className}>
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
