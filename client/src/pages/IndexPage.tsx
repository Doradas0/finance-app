import React from "react";
import { trpc } from "../utils/trpc";

import ExpenseForm from "./ExpenseForm";

export default function IndexPage() {
  const expenses = trpc.getExpenses.useQuery();
  const refetch = expenses.refetch;
  //order data by date ascending
  const sortedExpenses = expenses.data?.sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  const totalThisMonth = sortedExpenses?.reduce((acc, expense) => {
    const date = new Date(expense.date);
    const now = new Date();
    if (date.getMonth() === now.getMonth()) {
      return acc + parseFloat(expense.amount);
    }
    return acc;
  }, 0);

  const dataTable = () => (
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {sortedExpenses.map((expense) => (
            <tr key={expense.id}>
              <td>{expense.description}</td>
              <td>{expense.amount}</td>
              <td>{expense.date}</td>
              <td>{expense.category}</td>
            </tr>
          ))}
        </tbody>
      </table>
  );

  return (
    <div>
      <h1>Expenses</h1>
      <ExpenseForm onSubmit={refetch} />
      <p>Total this month: {totalThisMonth}</p>
      {expenses.data ? dataTable() : <p>Loading...</p>}
    </div>
  );
}
