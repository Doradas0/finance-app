import React from "react";
import { trpc, RouterInput } from "../utils/trpc";
import { z } from "zod";
import { useState } from "react";

type Sendtransaction = RouterInput["createTransaction"];

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const utils = trpc.useContext();
  const transactions = trpc.listTransactions.useQuery();

  const createTransaction = trpc.createTransaction.useMutation();
  const deleteTransaction = trpc.deleteTransaction.useMutation();
  const updateTransaction = trpc.updateTransaction.useMutation();

  const handleFormSubmit = (transaction: Sendtransaction) => {
    createTransaction.mutate(transaction, {
      onSuccess: () => {
        utils.listTransactions.invalidate();
      },
    });
  };

  const handleDelete = (id: string) => {
    deleteTransaction.mutate(id, {
      onSuccess: () => {
        utils.listTransactions.invalidate();
      },
    });
  };

  const handleUpdate = (transaction: Transaction) => {
    updateTransaction.mutate(transaction, {
      onSuccess: () => {
        console.log("updated");
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

  const transactionsUntilDate = transactions.data.filter(
    (transaction) => new Date(transaction.date) <= selectedDate
  );

  const totalExpenses = expenses
    .reduce((acc, transaction) => acc + Number(transaction.amount), 0)
    .toFixed(2);

  const totalIncome = income
    .reduce((acc, transaction) => acc + Number(transaction.amount), 0)
    .toFixed(2);

  const uniqueAccounts = [
    ...new Set(transactions.data.map((transaction) => transaction.account)),
  ];

  const totalForAccount = (account: string) => {
    const transactionsForAccount = transactionsUntilDate?.filter(
      (transaction) => transaction.account === account
    );
    const total = transactionsForAccount?.reduce(
      (acc, transaction) =>
        transaction.type === "expense"
          ? acc - Number(transaction.amount)
          : acc + Number(transaction.amount),
      0
    );
    if (!total) {
      return 0;
    }
    return total.toFixed(2);
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
      <h3>Until Date</h3>
      <input
        type="date"
        value={selectedDate.toISOString().split("T")[0]}
        onChange={(e) => setSelectedDate(new Date(e.target.value))}
      />
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
        handleUpdate={handleUpdate}
      />
      <h1>Income</h1>
      <p>Total this month: {totalIncome} </p>
      <FinanceForm type="income" submitForm={handleFormSubmit} />
      <DataTable
        transactionData={sortData(income, "date")}
        handleDelete={handleDelete}
        handleUpdate={handleUpdate}
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
      paid: z.coerce.boolean(),
    });
    const data = schema.safeParse({
      amount: formData.get("amount"),
      date: formData.get("date"),
      description: formData.get("description"),
      category: formData.get("category"),
      type: type,
      account: formData.get("account"),
      paid: formData.get("paid"),
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
      paid: z.coerce.boolean(),
    });
    const data = schema.safeParse({
      amount: formData.get("amount"),
      date: formData.get("date"),
      description: formData.get("description"),
      category: "transfer",
      type: "expense",
      account: formData.get("fromAccount"),
      paid: formData.get("paid"),
    });
    const data2 = schema.safeParse({
      amount: formData.get("amount"),
      date: formData.get("date"),
      description: formData.get("description"),
      category: "transfer",
      type: "income",
      account: formData.get("toAccount"),
      paid: formData.get("paid"),
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
  handleUpdate: (transaction: any) => void;
}) => {
  const { transactionData, handleDelete, handleUpdate } = props;
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
          <th>Paid</th>
        </tr>
      </thead>
      <tbody>
        {transactionData.map((transaction) => {
          const [currentTransaction, setTransaction] = useState(transaction);
          const handleValueChange = (
            e: React.ChangeEvent<HTMLInputElement>
          ) => {
            setTransaction({
              ...currentTransaction,
              [e.target.name]: e.target.value,
            });
          };
          const handleCheckboxChange = (
            e: React.ChangeEvent<HTMLInputElement>
          ) => {
            setTransaction({
              ...currentTransaction,
              [e.target.name]:  e.target.checked
            })
          }
          const handleUpdateClick = () => {
            const schema = z.object({
              id: z.string().min(1),
              amount: z.string().min(1),
              date: z.string().min(1),
              description: z.string().min(1),
              category: z.string().min(1),
              type: z.string().min(1),
              account: z.string().min(1),
              paid: z.coerce.boolean(),
            });
            const data = schema.safeParse(currentTransaction);
            if (data.success) {
              handleUpdate(data.data);
            }
            if (!data.success) {
              alert("Please fill out all fields");
              console.log(data.error);
            }
            handleUpdate(currentTransaction);
          };
          return (
            <tr key={transaction.id}>
              <td>
                <input
                  type="text"
                  name="description"
                  value={currentTransaction.description}
                  onChange={handleValueChange}
                />
              </td>
              <td>
                <input
                  type="number"
                  name="amount"
                  value={currentTransaction.amount}
                  onChange={handleValueChange}
                />
              </td>
              <td>
                <input
                  type="date"
                  name="date"
                  value={currentTransaction.date}
                  onChange={handleValueChange}
                />
              </td>
              <td>
                <input
                  type="text"
                  name="category"
                  value={currentTransaction.category}
                  onChange={handleValueChange}
                />
              </td>
              <td>
                <input
                  type="text"
                  name="account"
                  value={currentTransaction.account}
                  onChange={handleValueChange}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  name="paid"
                  checked={currentTransaction.paid}
                  onChange={handleCheckboxChange}
                />
              </td>
              <td>
                <button onClick={handleUpdateClick}>Update</button>
              </td>
              <td>
                <button onClick={() => handleDelete(transaction._id)}>
                  Delete
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
