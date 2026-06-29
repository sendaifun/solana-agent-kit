// ===== REQUEST TYPES =====

export interface CreateOrderRequest {
  payment: PaymentConfig;
  lineItems: LineItem[];
  recipient?: RecipientConfig;
  locale?: string;
}

export interface PaymentConfig {
  method: string; // e.g., "solana", "stripe-payment-element"
  currency: string; // e.g., "sol", "usdc"
  payerAddress: string; // Solana wallet address (required for payment)
  receiptEmail?: string; // Required for credit card payments
}

export interface LineItem {
  // For physical products
  productLocator?: string; // Format: "amazon:<asin>" or "shopify:<url>:<variant-id>"
}

export interface ExecutionParameters {
  mode: "exact-in" | "exact-out";
  amount: string; // Amount in USD for exact-in mode
  maxSlippageBps?: string; // Optional slippage tolerance (e.g., "500" for 5%)
}

export interface CallData {
  totalPrice?: string;
  quantity?: number;
  [key: string]: any; // Additional parameters that match your contract's mint function
}

export interface RecipientConfig {
  email?: string; // For Crossmint custodial wallet delivery
  walletAddress?: string; // For direct wallet delivery
  physicalAddress?: PhysicalAddress; // Required for physical products
}

export interface PhysicalAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string; // Required for US addresses
  postalCode: string;
  country: string; // Currently only "US" supported
}

// ===== RESPONSE TYPES =====

export interface CreateOrderResponse {
  clientSecret?: string; // Present when using client-side API keys
  order: Order;
  message?: string;
}

export interface Order {
  orderId: string;
  phase: OrderPhase;
  locale: string;
  lineItems: OrderLineItem[];
  quote: Quote;
  payment: Payment;
}

export type OrderPhase = "quote" | "payment" | "delivery" | "completed";

export interface OrderLineItem {
  chain: string; // e.g., "solana"
  quantity: number;
  callData?: CallData;
  metadata: ItemMetadata;
  quote: LineItemQuote;
  delivery: DeliveryInfo;
  executionMode?: "exact-in" | "exact-out";
  maxSlippageBps?: string;
  executionParams?: ExecutionParameters;
}

export interface ItemMetadata {
  name: string;
  description: string;
  imageUrl: string;
  collection?: {
    name: string;
    description: string;
    imageUrl: string;
  };
}

export interface LineItemQuote {
  status: QuoteStatus;
  charges: {
    unit: PriceAmount;
    gas?: PriceAmount; // May not be present for all chains
  };
  totalPrice: PriceAmount;
  quantityRange?: {
    lowerBound: string;
    upperBound: string;
  };
}

export type QuoteStatus =
  | "valid"
  | "requires-recipient"
  | "requires-physical-address"
  | "expired"
  | "item-unavailable";

export interface PriceAmount {
  amount: string;
  currency: string;
}

export interface Quote {
  status: QuoteStatus | "all-line-items-unavailable";
  quotedAt: string; // ISO timestamp
  expiresAt: string; // ISO timestamp
  totalPrice: PriceAmount;
}

export interface Payment {
  status: PaymentStatus;
  method?: string;
  currency?: string;
  preparation?: PaymentPreparation;
  refunded?: RefundInfo; // Present if payment was refunded
}

export type PaymentStatus =
  | "requires-quote"
  | "requires-crypto-payer-address"
  | "requires-physical-address"
  | "crypto-payer-insufficient-funds"
  | "crypto-payer-insufficient-funds-for-gas"
  | "awaiting-payment"
  | "requires-kyc"
  | "rejected-kyc"
  | "manual-kyc"
  | "completed";

export interface PaymentPreparation {
  // For crypto payments
  method?: "crypto";
  chain?: string;
  payerAddress?: string;
  serializedTransaction?: string; // Base58 encoded transaction for Solana

  // For credit card payments (Stripe)
  stripeClientSecret?: string;
  stripePublishableKey?: string;

  // For Checkout.com payments
  checkoutcomPaymentSession?: string;
  checkoutcomPublicKey?: string;

  // For KYC requirements
  kyc?: {
    provider: string;
    templateId: string;
    referenceId: string;
    environmentId?: string;
  };
}

export interface RefundInfo {
  amount: string;
  currency: string;
  txId: string;
  chain: string;
}

export interface DeliveryInfo {
  status: DeliveryStatus;
  recipient?: DeliveryRecipient;
}

export type DeliveryStatus =
  | "awaiting-payment"
  | "in-progress"
  | "completed"
  | "failed";

export interface DeliveryRecipient {
  locator: string; // e.g., "solana:<wallet-address>"
  walletAddress?: string;
  email?: string;
}

// ===== UTILITY TYPES =====

export interface ErrorResponse {
  error: boolean;
  message: string;
}
