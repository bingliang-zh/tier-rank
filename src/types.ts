export interface Item {
  id: string;
  content: string; // URL or text
}

export interface Tier {
  id: string;
  label: string;
  color: string;
  items: Item[];
}

export type TierListState = Tier[];
