import React from "react";
import { trpc } from "../utils/trpc";

import ExpenseForm from "./ExpenseForm";
import IncomeForm from "./IncomeForm";

const totalMonthlyExpenses = (expenses) =>
  expenses.reduce((acc, expense) => {
    const date = new Date(expense.date);
    const now = new Date();
    if (date.getMonth() === now.getMonth()) {
      return acc + parseFloat(expense.amount);
    }
    return acc;
  }, 0);

const totalMonthlyIncome = (income) =>
  income.reduce((acc, income) => {
    const date = new Date(income.date);
    const now = new Date();
    if (date.getMonth() === now.getMonth()) {
      return acc + parseFloat(income.amount);
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

  const getIncome = () => {
    const income = trpc.income.get.useQuery();
    const sortedIncome = income.data?.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    return sortedIncome;
  };
  const income = getIncome();
  const totalIncome = income ? totalMonthlyIncome(income) : 0;

  return (
    <div>
      <h1>Expenses</h1>
      <ExpenseForm />
      <p>Total this month: {totalExpenses}</p>
      {expenses ? dataTable() : <p>Loading...</p>}
      <h1>Income</h1>
      <IncomeForm />
      <p>Total this month: {totalIncome}</p>
      {income ? (
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
            {income.map((income) => (
              <tr key={income.id}>
                <td>{income.description}</td>
                <td>{income.amount}</td>
                <td>{income.date}</td>
                <td>{income.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading...</p>
      )}
      <h1>Net</h1>
      <p>{totalIncome - totalExpenses}</p>
    </div>
  );
}
