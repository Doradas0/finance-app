export type ExpenseItem = {
  amount: number;
  description: string;
  date: string;
  id: string;
};

export interface ExpenseDBItem extends ExpenseItem {
  PK: string;
  SK: string;
}
