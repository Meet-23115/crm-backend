import { Types } from "mongoose";

export const toId = (value: unknown) =>
  value instanceof Types.ObjectId ? value.toString() : String(value);

export const normalizeProgress = (value: number) =>
  Math.max(0, Math.min(100, Math.round(value)));
