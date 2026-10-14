// Prisma `Decimal` columns are serialized as strings by the API.
type Decimal = string | number;

export interface ApiError {
  message: string;
  issues?: unknown;
}

// --- Auth ---
export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name?: string;
}

// --- Wallet ---
export interface Balance {
  walletId: string;
  balance: number;
  currency: string;
}

export type EntryType = "CREDIT" | "DEBIT";
export type TxType =
  | "DEPOSIT"
  | "TRANSFER"
  | "WITHDRAWAL"
  | "INVOICE_PAYMENT"
  | "CARD_PURCHASE";

export interface HistoryEntry {
  id: string;
  transactionId: string;
  type: EntryType;
  amount: number;
  transactionType: TxType;
  date: string;
}

export interface Reconciliation {
  walletId: string;
  cachedBalance: number;
  reconciledLedgerBalance: number;
  isBalanced: boolean;
}

// --- Transfers ---
export interface TransferPayload {
  receiverWalletId: string;
  amount: number;
}

export interface TransferResult {
  success: boolean;
  transactionId: string;
  amount: number;
}

// --- Cards ---
export type CardStatus = "ACTIVE" | "BLOCKED" | "CANCELLED";

export interface Card {
  id: string;
  walletId: string;
  cardNumberLast4: string;
  expiryMonth: number;
  expiryYear: number;
  status: CardStatus;
  type: "VIRTUAL" | "PHYSICAL";
  dailyLimit: Decimal | null;
  createdAt: string;
  updatedAt: string;
}

// --- Invoices ---
export type InvoiceStatus = "PENDING" | "PAID" | "CANCELLED" | "OVERDUE";

interface InvoiceParty {
  name: string;
  email: string;
}

export interface Invoice {
  id: string;
  creatorId: string;
  creator?: InvoiceParty;
  payerEmail: string | null;
  payerId: string | null;
  payer?: InvoiceParty | null;
  amount: Decimal;
  description: string | null;
  status: InvoiceStatus;
  dueDate: string | null;
  transactionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoicePayload {
  amount: number;
  description?: string;
  payerEmail?: string;
}

export interface PayInvoiceResult {
  success: boolean;
  invoice: Invoice;
  transactionId: string;
}

// --- Webhooks ---
export interface WebhookEndpoint {
  id: string;
  url: string;
  secret: string;
  isActive: boolean;
  createdAt: string;
}

export interface WebhookDelivery {
  id: string;
  webhookEndpointId: string;
  webhookEndpoint: { url: string };
  payload: {
    event: string;
    payload: Record<string, unknown>;
    timestamp: string;
  };
  responseCode: number | null;
  status: "SUCCESS" | "FAILED";
  createdAt: string;
}
