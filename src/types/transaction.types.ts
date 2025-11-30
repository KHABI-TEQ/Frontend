/** @format */

export interface TransactionUser {
  _id: string;
  email: string;
  lastName: string;
  firstName: string;
}

export interface TransactionFromWho {
  kind: "User";
  item: string | TransactionUser;
}

export interface Transaction {
  _id: string;
  reference: string;
  fromWho: TransactionFromWho;
  amount: number;
  currency: string;
  status: "success" | "pending" | "failed";
  transactionType: string;
  paymentMode: string;
  platform: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface TransactionResponse {
  success: boolean;
  data: Transaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SingleTransactionResponse {
  success: boolean;
  data: Transaction;
}
