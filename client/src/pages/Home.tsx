import React from 'react';
import { trpc, RouterInput} from "../utils/trpc";
import { z } from "zod";

type Sendtransaction = RouterInput['createTransaction'];

export default function Home() {
  const createTransaction = trpc.createTransaction.useMutation();
  const deleteTransaction = trpc.deleteTransaction.useMutation();


  const handleFormSubmit = (transaction: Sendtransaction) => {
    createTransaction.mutate(transaction);
  };

  const transactions = trpc.listTransactions.useQuery();

  if(transactions.isLoading) {
    return <div>Loading...</div>
  }

  if(!transactions.data) {
    return <div>No transactions</div>
  }

  type Transaction = typeof transactions.data[0];
  type TransactionKeys = keyof Transaction;

  const expenses = transactions.data.filter((transaction) => transaction.type === "expense");
  const income = transactions.data.filter((transaction) => transaction.type === "income");

  const totalExpenses = expenses.reduce((acc, transaction) => acc + Number(transaction.amount), 0);
  const totalIncome = income.reduce((acc, transaction) => acc + Number(transaction.amount), 0);

  const balance = totalIncome - totalExpenses;

  const handleDelete = (id: string) => {
    deleteTransaction.mutate(id);
  };

  const sortData = (data: Transaction[], field: TransactionKeys) => {
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
      <FinanceForm type="expense" submitForm={handleFormSubmit} />
      <DataTable
        transactionData={sortData(expenses, "date")}
        handleDelete={handleDelete}
      />
      <h1>Income</h1>
      <p>Total this month: {totalIncome} </p>
      <FinanceForm type="income" submitForm={handleFormSubmit} />
      <DataTable
        transactionData={sortData(income, "date")}
        handleDelete={handleDelete}
      />
      <h1>Net</h1>
      <p>Total this month: {balance} </p>
    </div>
  );
}

type FinanceFormProps = {
  type: "income" | "expense";
  submitForm: (date: Sendtransaction) => void;
}

const FinanceForm = (props: FinanceFormProps) => {
  const { type, submitForm } = props;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const schema = z.object({
      amount: z.string().min(1),
      date: z.string().min(1),
      description: z.string().min(1),
      category: z.string().min(1),
      recurring: z.string().min(1),
      type: z.string().min(1),
    });
    const data = schema.safeParse({
      amount: formData.get("amount"),
      date: formData.get("date"),
      description: formData.get("description"),
      category: formData.get("category"),
      recurring: formData.get("recurring"),
      type: type,
    })
    if(data.success) {
      submitForm(data.data);
    }
    if (!data.success) {
      alert("Please fill out all fields");
      console.log(data.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="amount">Amount</label>
      <input type="number" name="amount" id="amount" />
      <label htmlFor="description">Description</label>
      <input type="text" name="description" id="description" />
      <label htmlFor="date">Date</label>
      <input type="date" name="date" id="date" />
      <label htmlFor="category">Category</label>
      <input type="text" name="category" id="category" />
      <label htmlFor="recurring">Recurring</label>
      <input type="checkbox" name="recurring" id="recurring" />
      <button type="submit">Submit</button>
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
