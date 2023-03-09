import React from "react";
import { trpc } from "../utils/trpc";
import { z } from "zod";

export default function IncomeForm() {
  const createIncomeCommand = trpc.income.create.useMutation();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    //validate form types converting amount from string to number, validate with zod and then submit to the mutation
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      amount: Number(formData.get("amount")),
      description: formData.get("description"),
      date: formData.get("date"),
      category: formData.get("category"),
    };
    const schema = z.object({
      amount: z.number().positive(),
      description: z.string().min(1),
      //date is iso string format
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      category: z.string().min(1),
    });
    const income = schema.parse(data);
    console.log(income);
    createIncomeCommand.mutate(income)
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
        <input type="date" name="date" />
      </label>
      <label>
        Category:
        <input type="text" name="category" />
      </label>
      <input type="submit" value="Submit" />
    </form>
  );
}