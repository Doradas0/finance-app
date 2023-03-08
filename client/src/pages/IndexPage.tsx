import React from "react";
import { trpc } from '../utils/trpc';

import ExpenseForm from "./ExpenseForm";

export default function IndexPage() {
  const expenses = trpc.getExpenses.useQuery();
  if (expenses.status === 'loading') {
    return <div>Loading...</div>;
  }
  if (expenses.status === 'error') {
    return <div>Error: {expenses.error.message}</div>;
  }
  if (!expenses.data || expenses.data.length === 0) {
    return <div>No expenses found</div>;
  }
  const refetch = expenses.refetch;
  //order data by date ascending
  const sortedExpenses = expenses.data.sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  return (
    <div>
      <h1>Expenses</h1>
      <pre>{JSON.stringify(sortedExpenses, null, 2)}</pre>
      <ExpenseForm onSubmit={refetch}/>
    </div>
  );
}

