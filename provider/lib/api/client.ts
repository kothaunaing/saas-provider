import axios, { type AxiosError } from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "x-serenity-portal": "provider",
  },
});

export interface PaginationMeta {
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationParams {
  page?: number;
  size?: number;
}

export function apiError(cause: unknown, fallback: string): string {
  const err = cause as AxiosError<{ message?: string | string[] }>;
  const msg = err?.response?.data?.message;
  if (Array.isArray(msg)) return msg[0];
  if (typeof msg === "string") return msg;
  return fallback;
}
export async function getHealth() {
  return (await api.get<{ status: string; timestamp: string }>("/health")).data;
}
