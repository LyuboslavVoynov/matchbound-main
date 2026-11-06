import { randomInt } from "node:crypto";

/** Uses Node's CSPRNG; each item has exactly 1/n probability. */
export function selectRandomFixture<T>(fixtures: readonly T[], nextInt: (maxExclusive: number) => number = randomInt): T | undefined {
  if (fixtures.length === 0) return undefined;
  return fixtures[nextInt(fixtures.length)];
}
