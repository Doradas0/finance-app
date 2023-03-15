import React from 'react';
import { trpc } from "../utils/trpc";

export default function Home() {
  const sendTransaction = trpc.createTransaction.useMutation();
  const deleteTransaction = trpc.deleteTransaction.useMutation();

  const handleFormSubmit = () => {
    const transaction = {
      amount: "100",
      description: "test",
      date: new Date().toISOString(),
      category: "test",
      type: "expense",
      recurring: false,
    };
    sendTransaction.mutate(transaction);
  };

  const transactions = trpc.listTransactions.useQuery();

  if(transactions.isLoading) {
    return <div>Loading...</div>
  }

  if(!transactions.data) {
    return <div>No transactions</div>
  }

  const expenses = transactions.data.filter((transaction) => transaction.type === "expense");
  const income = transactions.data.filter((transaction) => transaction.type === "income");

  const totalExpenses = expenses.reduce((acc, transaction) => acc + Number(transaction.amount), 0);
  const totalIncome = income.reduce((acc, transaction) => acc + Number(transaction.amount), 0);

  const balance = totalIncome - totalExpenses;

  const handleDelete = (id: string) => {
    deleteTransaction.mutate(id);
  };

  const sortData = (data, field) => {
    return data?.sort((a, b) => {
      if (a[field] < b[field]) {
        return -1;
      }
      if (a[field] > b[field]) {
        return 1;
      }
      return 0;
    });
  };

  return (
    <div>
      <h1>Expenses</h1>
      <p>Total this month: {totalExpenses} </p>
      <FinanceForm type="expense" onSubmit={handleFormSubmit} />
      <DataTable
        transactionData={sortData(expenses, "date")}
        handleDelete={handleDelete}
      />
      <h1>Income</h1>
      <p>Total this month: {totalIncome} </p>
      <FinanceForm type="income" onSubmit={handleFormSubmit} />
      <DataTable
        transactionData={sortData(income, "date")}
        handleDelete={handleDelete}
      />
      <h1>Net</h1>
      <p>Total this month: {balance} </p>
    </div>
  );
}

const FinanceForm = ({ type, onSubmit }) => {
  const [description, setDescription] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [date, setDate] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [recurring, setRecurring] = React.useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({ description, amount, date, category, type });
    setDescription("");
    setAmount("");
    setDate("");
    setCategory("");
    setRecurring(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Description
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <label>
        Amount
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </label>
      <label>
        Date
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>
      <label>
        Category
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </label>
      <label>
        Recurring
        <input
          type="checkbox"
          checked={recurring}
          onChange={(e) => setRecurring(e.target.checked)}
        />
      </label>
      <button type="submit">Submit {type}</button>
    </form>
  );
};

const DataTable = (props: {
  transactionData: any[];
  handleDelete: (id: string) => void;
}) => {
  const { transactionData, handleDelete } = props;
  if (!transactionData) {
    return null;
  }
  return (
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
        {transactionData.map((transaction) => (
          <tr key={transaction?.id}>
            <td>{transaction?.description}</td>
            <td>{transaction?.amount}</td>
            <td>{transaction?.date}</td>
            <td>{transaction?.category}</td>
            <td>
              <button onClick={() => handleDelete(transaction?.id)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
