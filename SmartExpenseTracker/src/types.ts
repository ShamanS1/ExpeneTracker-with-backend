export type Expense = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
  paymentMethod: 'Cash' | 'Credit Card' | 'Bank Account';
};
