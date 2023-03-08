import React from "react";
import { trpc } from "../utils/trpc";

import ExpenseForm from "./ExpenseForm";

const totalMonthlyExpenses = (expenses) =>
  expenses.reduce((acc, expense) => {
    const date = new Date(expense.date);
    const now = new Date();
    if (date.getMonth() === now.getMonth()) {
      return acc + parseFloat(expense.amount);
    }
    return acc;
  }, 0);

export default function IndexPage() {
  const getExpenses = () => {
    const expenses = trpc.getExpenses.useQuery();
    //order data by date ascending
    const sortedExpenses = expenses.data?.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    return sortedExpenses;
  };
  const expenses = getExpenses();
  const totalExpenses = expenses ? totalMonthlyExpenses(expenses) : 0;
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
        {expenses.map((expense) => (
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
      <ExpenseForm />
      <p>Total this month: {totalExpenses}</p>
      {expenses ? dataTable() : <p>Loading...</p>}
    </div>
  );
}
