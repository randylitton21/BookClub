import type { Club } from "./types";

/** Default read id for clubs created before the reads feature. */
export function defaultActiveReadId(clubId: string): string {
  return `${clubId}_read1`;
}

export function clubActiveReadId(club: Club): string {
  return club.activeReadId || defaultActiveReadId(club.clubId);
}

export function generateNextReadId(clubId: string): string {
  return `${clubId}_read_${Date.now()}`;
}
