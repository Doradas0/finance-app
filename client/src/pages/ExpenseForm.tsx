import React from "react";
import { trpc } from "../utils/trpc";
import { z } from "zod";

export default function ExpenseForm() {
  const createExpenseCommande = trpc.createExpense.useMutation();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    //validate form types converting amount from string to number, validate with zod and then submit to the mutation
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      amount: Number(formData.get("amount")),
      description: formData.get("description"),
      date: formData.get("date"),
    };
    const schema = z.object({
      amount: z.number().positive(),
      description: z.string().min(1),
      date: z.string().min(1),
    });
    const expense = schema.parse(data);
    console.log(expense);
    createExpenseCommande.mutate(expense);
  };
  return (
    <form onSubmit={handleSubmit}>
      <label>
        Description:
        <input type="text" name="description" />
      </label>
      <label>
        Amount:
        <input type="number" name="amount" />
      </label>
      <label>
        Date:
        <input type="text" name="date" />
      </label>
      <input type="submit" value="Submit" />
    </form>
  );
}
