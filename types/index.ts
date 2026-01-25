import type { PromiseStatus, SourceType, EvidenceType, Role, PromiseType } from "@prisma/client";

export type Locale = "lv" | "en" | "ru";

export interface LocalizedText {
  lv: string;
  en: string;
  ru: string;
}

export interface PartyWithRelations {
  id: string;
  name: LocalizedText;
  description: LocalizedText | null;
  slug: string;
  color: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  isCoalition: boolean;
  politicians: PoliticianBasic[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PoliticianBasic {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
}

export interface PoliticianWithRelations {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  role: LocalizedText | null;
  bio: LocalizedText | null;
  isActive: boolean;
  partyId: string | null;
  party: {
    id: string;
    name: LocalizedText;
    slug: string;
    color: string;
    logoUrl: string | null;
  } | null;
  promises: PromiseBasic[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryWithRelations {
  id: string;
  name: LocalizedText;
  description: LocalizedText | null;
  slug: string;
  color: string;
  icon: string | null;
  _count?: {
    promises: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PromiseBasic {
  id: string;
  title: LocalizedText;
  status: PromiseStatus;
  dateOfPromise: Date;
}

export interface PromiseWithRelations {
  id: string;
  title: LocalizedText;
  description: LocalizedText | null;
  status: PromiseStatus;
  type: PromiseType;
  explanation: LocalizedText | null;
  dateOfPromise: Date;
  statusUpdatedAt: Date | null;
  politicianId: string | null;
  politician: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    party: {
      id: string;
      name: LocalizedText;
      slug: string;
      color: string;
    } | null;
  } | null;
  partyId: string | null;
  party: {
    id: string;
    name: LocalizedText;
    slug: string;
    color: string;
    logoUrl: string | null;
  } | null;
  coalitionParties: {
    id: string;
    name: LocalizedText;
    slug: string;
    color: string;
    logoUrl: string | null;
  }[];
  categoryId: string;
  category: {
    id: string;
    name: LocalizedText;
    slug: string;
    color: string;
  };
  sources: SourceData[];
  evidence: EvidenceData[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SourceData {
  id: string;
  type: SourceType;
  url: string;
  title: LocalizedText | null;
  description: LocalizedText | null;
}

export interface EvidenceData {
  id: string;
  type: EvidenceType;
  url: string;
  description: LocalizedText | null;
  promiseId: string;
}

export interface PromiseStats {
  total: number;
  kept: number;
  notKept: number;
  pending: number;
  cancelled: number;
  partial: number;
}

export interface FilterParams {
  status?: PromiseStatus | "all";
  type?: PromiseType;
  politician?: string;
  category?: string;
  party?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export { PromiseStatus, SourceType, EvidenceType, Role, PromiseType };
