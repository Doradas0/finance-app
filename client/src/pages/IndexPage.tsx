import React from "react";
import { trpc } from '../utils/trpc';

export default function IndexPage() {
  const expenses = trpc.getExpenses.useQuery();
  if (expenses.status === 'loading') {
    return <div>Loading...</div>;
  }
  if (expenses.status === 'error') {
    return <div>Error: {expenses.error.message}</div>;
  }
  return (
    <div>
      <h1>Expenses</h1>
      <pre>{JSON.stringify(expenses.data, null, 2)}</pre>
    </div>
  );
}

