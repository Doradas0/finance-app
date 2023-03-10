import React from "react";
import { trpc } from "../utils/trpc";
import {z} from 'zod'

export default function IndexPage() {

  const handleFormSubmit = (event) => {
    const { description, amount, date, category, type } = event;
    const schema = z.object({
      amount: z.number().positive(),
      description: z.string().min(1),
      //date is iso string format
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      category: z.string().min(1),
      type: z.string().min(1),
    });
    const data = schema.parse({ description, amount, date, category, type });
  };

  return (
    <div>
      <h1>Expenses</h1>
      <p>Total this month: </p>
      <FinanceForm type="expense" onSubmit={handleFormSubmit} />
      <DataTable transactionData={[]} />
      <h1>Income</h1>
      <p>Total this month: </p>
      <FinanceForm type="income" onSubmit={handleFormSubmit} />
      <DataTable transactionData={[]} />
      <h1>Net</h1>
      <p>Total this month: </p>
    </div>
  );
}

const FinanceForm = ({ type, onSubmit }) => {
  const [description, setDescription] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [date, setDate] = React.useState("");
  const [category, setCategory] = React.useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({ description, amount, date, category, type });
    setDescription("");
    setAmount("");
    setDate("");
    setCategory("");
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
      <button type="submit">Submit {type}</button>
    </form>
  );
}

const DataTable = (props: {transactionData: any[]}) => {
  const { transactionData } = props;
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
    </tr>
))}
    </tbody>
  </table>
  )
};
