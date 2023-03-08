import React from "react";
import { trpc } from "../utils/trpc";

import ExpenseForm from "./ExpenseForm";

export default function IndexPage() {
  const expenses = trpc.getExpenses.useQuery();
  if (expenses.status === "loading") {
    return <div>Loading...</div>;
  }
  if (expenses.status === "error") {
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
  const totalThisMonth = sortedExpenses.reduce((acc, expense) => {
    const date = new Date(expense.date);
    const now = new Date();
    if (date.getMonth() === now.getMonth()) {
      return acc + parseFloat(expense.amount);
    }
    return acc;
  }, 0);

  return (
    <div>
      <h1>Expenses</h1>
      <ExpenseForm onSubmit={refetch} />
      <p>Total this month: {totalThisMonth}</p>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {sortedExpenses.map((expense) => (
            <tr key={expense.id}>
              <td>{expense.description}</td>
              <td>{expense.amount}</td>
              <td>{expense.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
