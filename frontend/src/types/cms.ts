export interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  author?: string;
  publishedAt?: string;
  status: string;
  category?: string;
  coverImage?: string;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ArticlePayload {
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  author?: string;
  status?: string;
  category?: string;
  coverImage?: string;
}

export interface DownloadResource {
  _id: string;
  title: string;
  category: string;
  description?: string;
  fileUrl: string;
  fileSize?: string;
  fileType?: string;
  documentType?: string;
  targetAudience?: string;
  isPublic?: boolean;
  status: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DownloadResourcePayload {
  title: string;
  category: string;
  description?: string;
  fileUrl: string;
  fileSize?: string;
  fileType?: string;
  documentType?: string;
  targetAudience?: string;
  isPublic?: boolean;
  status?: string;
}

export type EnquiryStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'ARCHIVED' | 'PENDING' | string;

export interface Enquiry {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: EnquiryStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface EnquiryPayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}
