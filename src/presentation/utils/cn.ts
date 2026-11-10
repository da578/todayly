/**
 * Merges class names and Panda CSS generated class strings.
 *
 * # Traceability
 * - Requirement: `@impl-infra:UTIL-CN`
 *
 * # Arguments
 * - `...inputs`: List of class names, conditionals, or undefined/null.
 *
 * # Returns
 * Combined class string with falsy values filtered out.
 *
 * # Examples
 * ```ts
 * const className = cn("base-class", isActive && "active");
 * ```
 */
import { cx } from "@/styled-system/css";

export function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return cx(...inputs);
}
