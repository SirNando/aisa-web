export const playfulObjectKinds = [
  "kite",
  "tree",
  "blocks",
  "train",
  "cloud",
  "book-pencil",
  "elephant-tree",
  "balloon-plane",
  "puzzle",
] as const;

export type PlayfulObjectKind = (typeof playfulObjectKinds)[number];
export type PlayfulTone = "leaf" | "sky" | "sand" | "inverse";
export type PlayfulMotion = "none" | "float" | "sway" | "bob";

export interface PlayfulDecoration {
  kind: PlayfulObjectKind;
  tone?: PlayfulTone;
  motion?: PlayfulMotion;
}
