import { z } from "zod";

// Party schemas
export const createPartySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  logoUrl: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  websiteUrl: z.string().url().optional().nullable(),
});

export const updatePartySchema = createPartySchema.partial();

// Politician schemas
export const createPoliticianSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100),
  imageUrl: z.string().url().optional().nullable(),
  role: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  partyId: z.string().cuid().optional().nullable(),
});

export const updatePoliticianSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(100).optional(),
  imageUrl: z.string().url().optional().nullable(),
  role: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  partyId: z.string().cuid().optional(),
});

// Category schemas
export const createCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  slug: z.string().min(1).max(100),
  color: z.string().min(1).max(100),
  icon: z.string().optional().nullable(),
});

export const updateCategorySchema = createCategorySchema.partial();

// Source schema
export const sourceSchema = z.object({
  type: z.enum(["VIDEO", "ARTICLE", "DOCUMENT", "SOCIAL_MEDIA", "INTERVIEW"]),
  url: z.string().url(),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

// Evidence schema
export const evidenceSchema = z.object({
  type: z.enum(["NEWS_ARTICLE", "OFFICIAL_DOCUMENT", "VIDEO", "STATISTICS", "OTHER"]),
  url: z.string().url(),
  description: z.string().optional().nullable(),
});

// Promise schemas
export const createPromiseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  status: z.enum(["KEPT", "NOT_KEPT", "IN_PROGRESS", "ABANDONED", "PARTIAL"]).default("IN_PROGRESS"),
  explanation: z.string().optional().nullable(),
  dateOfPromise: z.string().datetime().or(z.date()),
  statusUpdatedAt: z.string().datetime().optional().nullable(),
  politicianId: z.string().cuid(),
  categoryId: z.string().cuid(),
  sources: z.array(sourceSchema).optional(),
  evidence: z.array(evidenceSchema).optional(),
});

export const updatePromiseSchema = createPromiseSchema.partial();

// Filter schemas
export const promiseFilterSchema = z.object({
  status: z.enum(["KEPT", "NOT_KEPT", "IN_PROGRESS", "ABANDONED", "PARTIAL", "all"]).optional(),
  politician: z.string().optional(),
  category: z.string().optional(),
  party: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

// User schemas
export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  role: z.enum(["ADMIN", "EDITOR"]).default("ADMIN"),
});

export type CreatePartyInput = z.infer<typeof createPartySchema>;
export type UpdatePartyInput = z.infer<typeof updatePartySchema>;
export type CreatePoliticianInput = z.infer<typeof createPoliticianSchema>;
export type UpdatePoliticianInput = z.infer<typeof updatePoliticianSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreatePromiseInput = z.infer<typeof createPromiseSchema>;
export type UpdatePromiseInput = z.infer<typeof updatePromiseSchema>;
export type PromiseFilterInput = z.infer<typeof promiseFilterSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
