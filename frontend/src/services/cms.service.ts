import { apiClient, API_ENDPOINTS } from '@/api/axios';
import {
  Article,
  ArticlePayload,
  DownloadResource,
  DownloadResourcePayload,
  Enquiry,
  ApiResponse,
  PaginationParams,
} from '@/types';

// --- ARTICLES ---
export const getArticles = async (params: PaginationParams = {}): Promise<ApiResponse<Article[]>> => {
  const response = await apiClient.get<ApiResponse<Article[]>>(API_ENDPOINTS.cms.articles, { params });
  return response.data;
};

export const getArticleBySlug = async (slug: string): Promise<ApiResponse<Article>> => {
  const response = await apiClient.get<ApiResponse<Article>>(API_ENDPOINTS.cms.articleBySlug(slug));
  return response.data;
};

export const createArticle = async (data: ArticlePayload): Promise<ApiResponse<Article>> => {
  const response = await apiClient.post<ApiResponse<Article>>(API_ENDPOINTS.cms.articles, data);
  return response.data;
};

export const updateArticle = async (
  id: string,
  data: Partial<ArticlePayload>
): Promise<ApiResponse<Article>> => {
  const response = await apiClient.put<ApiResponse<Article>>(API_ENDPOINTS.cms.articleById(id), data);
  return response.data;
};

export const deleteArticle = async (id: string): Promise<ApiResponse> => {
  const response = await apiClient.delete<ApiResponse>(API_ENDPOINTS.cms.articleById(id));
  return response.data;
};

// --- DOWNLOAD RESOURCES ---
export const getResources = async (params: PaginationParams = {}): Promise<ApiResponse<DownloadResource[]>> => {
  const response = await apiClient.get<ApiResponse<DownloadResource[]>>(API_ENDPOINTS.cms.resources, { params });
  return response.data;
};

export const createResource = async (data: DownloadResourcePayload): Promise<ApiResponse<DownloadResource>> => {
  const response = await apiClient.post<ApiResponse<DownloadResource>>(API_ENDPOINTS.cms.resources, data);
  return response.data;
};

export const updateResource = async (
  id: string,
  data: Partial<DownloadResourcePayload>
): Promise<ApiResponse<DownloadResource>> => {
  const response = await apiClient.put<ApiResponse<DownloadResource>>(API_ENDPOINTS.cms.resourceById(id), data);
  return response.data;
};

export const deleteResource = async (id: string): Promise<ApiResponse> => {
  const response = await apiClient.delete<ApiResponse>(API_ENDPOINTS.cms.resourceById(id));
  return response.data;
};

// --- ENQUIRIES ---
export const getEnquiries = async (params: PaginationParams = {}): Promise<ApiResponse<Enquiry[]>> => {
  const response = await apiClient.get<ApiResponse<Enquiry[]>>(API_ENDPOINTS.cms.enquiries, { params });
  return response.data;
};

export const createEnquiry = async (data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<ApiResponse<Enquiry>> => {
  const response = await apiClient.post<ApiResponse<Enquiry>>(API_ENDPOINTS.cms.enquiries, data);
  return response.data;
};

export const updateEnquiryStatus = async (
  id: string,
  status: string
): Promise<ApiResponse<Enquiry>> => {
  const response = await apiClient.put<ApiResponse<Enquiry>>(API_ENDPOINTS.cms.enquiryStatus(id), { status });
  return response.data;
};

export default {
  getArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  getResources,
  createResource,
  updateResource,
  deleteResource,
  getEnquiries,
  createEnquiry,
  updateEnquiryStatus,
};
