export type ExpenseItem = {
  amount: number;
  description: string;
  date: string;
  category: string;
};

export interface ExpenseDBItem extends ExpenseItem {
  PK: string;
  SK: string;
}

export type IncomeItem = {
  amount: number;
  description: string;
  date: string;
  category: string;
};
