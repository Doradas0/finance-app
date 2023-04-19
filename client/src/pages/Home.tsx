import React from "react";
import { trpc, RouterInput } from "../utils/trpc";
import { z } from "zod";

type Sendtransaction = RouterInput["createTransaction"];

export default function Home() {
  const utils = trpc.useContext();
  const transactions = trpc.listTransactions.useQuery();

  const createTransaction = trpc.createTransaction.useMutation();
  const deleteTransaction = trpc.deleteTransaction.useMutation();

  const handleFormSubmit = (transaction: Sendtransaction) => {
    createTransaction.mutate(transaction, {
      onSuccess: () => {
        utils.listTransactions.invalidate();
      },
    });
  };

  if (transactions.isLoading) {
    return <div>Loading...</div>;
  }

  if (!transactions.data) {
    return <div>No transactions</div>;
  }

  type Transaction = typeof transactions.data[0];
  type TransactionKeys = keyof Transaction;

  const expenses = transactions.data.filter(
    (transaction) => transaction.type === "expense"
  );
  const income = transactions.data.filter(
    (transaction) => transaction.type === "income"
  );

  const totalExpenses = expenses.reduce(
    (acc, transaction) => acc + Number(transaction.amount),
    0
  ).toFixed(2);

  const totalIncome = income.reduce(
    (acc, transaction) => acc + Number(transaction.amount),
    0
  ).toFixed(2);



  const uniqueAccounts = [
    ...new Set(transactions.data.map((transaction) => transaction.account)),
  ];

  const totalForAccount = (account: string) => {
    const transactionsForAccount = transactions?.data?.filter(
      (transaction) => transaction.account === account
    );
    const total = transactionsForAccount?.reduce(
      (acc, transaction) =>
        transaction.type === "expense"
          ? acc - Number(transaction.amount) : acc + Number(transaction.amount),
      0
    );
    if (!total) {
      return 0;
    }
    return total.toFixed(2);
  };

  const handleDelete = (id: string) => {
    deleteTransaction.mutate(id, {
      onSuccess: () => {
        utils.listTransactions.invalidate();
      },
    });
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
      <h1>Accounts</h1>
      <ul>
        {uniqueAccounts.map((account) => (
          <li key={account}>
            {account}: {totalForAccount(account)}
          </li>
        ))}
      </ul>
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
      <h1>Transfers</h1>
      <FinanceForm type="transfer" submitForm={handleFormSubmit} />
    </div>
  );
}

type FinanceFormProps = {
  type: "income" | "expense" | "transfer";
  submitForm: (date: Sendtransaction) => void;
};

const FinanceForm = (props: FinanceFormProps) => {
  const { type, submitForm } = props;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    if (type === "transfer") {
      handleTransfer(formData, submitForm);
      return;
    }
    const schema = z.object({
      amount: z.string().min(1),
      date: z.string().min(1),
      description: z.string().min(1),
      category: z.string().min(1),
      type: z.string().min(1),
      account: z.string().min(1),
    });
    const data = schema.safeParse({
      amount: formData.get("amount"),
      date: formData.get("date"),
      description: formData.get("description"),
      category: formData.get("category"),
      type: type,
      account: formData.get("account"),
    });
    if (data.success) {
      submitForm(data.data);
    }
    if (!data.success) {
      alert("Please fill out all fields");
      console.log(data.error);
    }
  };

  const handleTransfer = (
    formData: FormData,
    submitForm: (date: Sendtransaction) => void
  ) => {
    // create two transactions, one for each account
    const schema = z.object({
      amount: z.string().min(1),
      date: z.string().min(1),
      description: z.string().min(1),
      category: z.string().min(1),
      type: z.string().min(1),
      account: z.string().min(1),
    });
    const data = schema.safeParse({
      amount: formData.get("amount"),
      date: formData.get("date"),
      description: formData.get("description"),
      category: "transfer",
      type: "expense",
      account: formData.get("fromAccount"),
    });
    const data2 = schema.safeParse({
      amount: formData.get("amount"),
      date: formData.get("date"),
      description: formData.get("description"),
      category: "transfer",
      type: "income",
      account: formData.get("toAccount"),
    });
    if (data.success && data2.success) {
      submitForm(data.data);
      submitForm(data2.data);
    }
    if (!data.success || !data2.success) {
      alert("Please fill out all fields");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="amount">Amount</label>
      <input type="number" name="amount" id="amount" step="0.01" />
      <label htmlFor="description">Description</label>
      <input type="text" name="description" id="description" />
      <label htmlFor="date">Date</label>
      <input type="date" name="date" id="date" />
      {type === "transfer" ? (
        <>
          <label htmlFor="fromAccount">From Account</label>
          <input type="text" name="fromAccount" id="fromAccount" />
          <label htmlFor="toAccount">To Account</label>
          <input type="text" name="toAccount" id="toAccount" />
        </>
      ) : (
        <>
          <label htmlFor="category">Category</label>
          <input type="text" name="category" id="category" />
          <label htmlFor="account">Account</label>
          <input type="text" name="account" id="account" />
        </>
      )}
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
          <th>Account</th>
        </tr>
      </thead>
      <tbody>
        {transactionData.map((transaction) => (
          <tr key={transaction?.id}>
            <td>{transaction?.description}</td>
            <td>{transaction?.amount}</td>
            <td>{transaction?.date}</td>
            <td>{transaction?.category}</td>
            <td>{transaction?.account}</td>
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
