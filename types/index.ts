import type { PromiseStatus, SourceType, EvidenceType, Role } from "@prisma/client";

export type Locale = "lv" | "en" | "ru";

export interface LocalizedText {
  lv: string;
  en: string;
  ru: string;
}

export interface PartyWithRelations {
  id: string;
  name: LocalizedText;
  slug: string;
  color: string;
  logoUrl: string | null;
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
  bio: LocalizedText | null;
  partyId: string;
  party: {
    id: string;
    name: LocalizedText;
    slug: string;
    color: string;
    logoUrl: string | null;
  };
  promises: PromiseBasic[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryWithRelations {
  id: string;
  name: LocalizedText;
  slug: string;
  color: string;
  _count?: {
    promises: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PromiseBasic {
  id: string;
  text: LocalizedText;
  status: PromiseStatus;
  dateOfPromise: Date;
}

export interface PromiseWithRelations {
  id: string;
  text: LocalizedText;
  status: PromiseStatus;
  explanation: LocalizedText | null;
  dateOfPromise: Date;
  politicianId: string;
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
    };
  };
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
}

export interface PromiseStats {
  total: number;
  kept: number;
  notKept: number;
  inProgress: number;
  abandoned: number;
  partial: number;
}

export interface FilterParams {
  status?: PromiseStatus | "all";
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

export { PromiseStatus, SourceType, EvidenceType, Role };
