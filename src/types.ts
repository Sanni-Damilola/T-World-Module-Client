import type { Storage, Role, AiStatus, TxType, TxSource, Asset, ConversionStatus } from './constants';

export interface User {
  _id: string;
  email: string;
  role: Role;
  tokenBalance: number;
}

export interface ContentItem {
  _id: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: string;
}

export interface Paged<T> {
  items: T[];
  page: number;
  pages: number;
  total: number;
}

export interface AiRun {
  _id: string;
  status: AiStatus;
  output: string;
  latencyMs: number;
  tokensAwarded: number;
  createdAt: string;
  contentId: { title: string } | null;
  userId: { email: string } | null;
}

export interface SummaryResult {
  status: AiStatus;
  fallback: boolean;
  error?: string;
  output: string;
  latencyMs: number;
  tokensAwarded: number;
  totalTokenBalance: number;
}

export interface Tx {
  _id: string;
  type: TxType;
  source: TxSource;
  amount: number;
  balanceAfter: number;
  createdAt: string;
}

export interface Conversion {
  _id: string;
  amount: number;
  convertedAmount: number;
  toAsset: Asset;
  status: ConversionStatus;
}

export interface Media {
  _id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  storage: Storage;
  createdAt: string;
}