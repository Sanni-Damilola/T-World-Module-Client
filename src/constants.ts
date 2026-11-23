
export const Role = {
  USER: 0, // normal account
  ADMIN: 1, // can add content, see all users and runs
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const AiStatus = {
  SUCCESS: 0,
  FAILED: 1,
  TIMEOUT: 2,
} as const;
export type AiStatus = (typeof AiStatus)[keyof typeof AiStatus];
export const AI_STATUS_LABEL: Record<AiStatus, string> = { 0: 'Success', 1: 'Failed', 2: 'Timeout' };

export const TxType = {
  EARN: 0,
  CONVERT: 1,
  WITHDRAW: 2,
} as const;
export type TxType = (typeof TxType)[keyof typeof TxType];
export const TX_TYPE_LABEL: Record<TxType, string> = { 0: 'Earned', 1: 'Converted', 2: 'Withdrawn' };

export const TxSource = {
  AI_USAGE: 0,
  MANUAL: 1,
  SYSTEM: 2,
} as const;
export type TxSource = (typeof TxSource)[keyof typeof TxSource];
export const TX_SOURCE_LABEL: Record<TxSource, string> = { 0: 'AI usage', 1: 'Admin grant', 2: 'System' };

export const Asset = {
  MOCK_USDT: 0,
  MOCK_ETH: 1,
} as const;
export type Asset = (typeof Asset)[keyof typeof Asset];
export const ASSET_LABEL: Record<Asset, string> = { 0: 'MOCK_USDT', 1: 'MOCK_ETH' };

export const ConversionStatus = {
  CONFIRMED: 0, // waiting to be withdrawn
  WITHDRAWN: 1,
} as const;
export type ConversionStatus = (typeof ConversionStatus)[keyof typeof ConversionStatus];
export const CONVERSION_STATUS_LABEL: Record<ConversionStatus, string> = { 0: 'confirmed', 1: 'withdrawn' };

// dropdown options for the summarize form
export const TONES = [
  { value: 0, label: 'neutral' },
  { value: 1, label: 'formal' },
  { value: 2, label: 'casual' },
];
export const LENGTHS = [
  { value: 0, label: 'short' },
  { value: 1, label: 'medium' },
  { value: 2, label: 'long' },
];

export const Storage = {
  CLOUDINARY: 0, // short term
  S3: 1, // long term
} as const;
export type Storage = (typeof Storage)[keyof typeof Storage];
export const STORAGE_LABEL: Record<Storage, string> = { 0: 'Cloudinary (short-term)', 1: 'S3 (long-term)' };