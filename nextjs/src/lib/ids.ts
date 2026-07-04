const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateClubId(length = 8): string {
  let id = "";
  for (let i = 0; i < length; i++) {
    id += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return id;
}

export function quizResultDocId(uid: string, weekId: string): string {
  return `${uid}_${weekId}`;
}
