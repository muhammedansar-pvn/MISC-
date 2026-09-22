import { apiClient, API_ENDPOINTS } from '@/lib/api';
import {
  EventItem,
  EventPayload,
  EventRegistration,
  EventRegistrationPayload,
  ApiResponse,
  PaginationParams,
} from '@/types';

export const getEvents = async (params: PaginationParams = {}): Promise<ApiResponse<EventItem[]>> => {
  const response = await apiClient.get<ApiResponse<EventItem[]>>(API_ENDPOINTS.events.list, { params });
  return response.data;
};

export const getEventBySlug = async (slug: string): Promise<ApiResponse<EventItem>> => {
  const response = await apiClient.get<ApiResponse<EventItem>>(API_ENDPOINTS.events.bySlug(slug));
  return response.data;
};

export const createEvent = async (data: EventPayload): Promise<ApiResponse<EventItem>> => {
  const response = await apiClient.post<ApiResponse<EventItem>>(API_ENDPOINTS.events.list, data);
  return response.data;
};

export const updateEvent = async (
  id: string,
  data: Partial<EventPayload>
): Promise<ApiResponse<EventItem>> => {
  const response = await apiClient.put<ApiResponse<EventItem>>(API_ENDPOINTS.events.byId(id), data);
  return response.data;
};

export const getEventRegistrations = async (
  params: PaginationParams = {}
): Promise<ApiResponse<EventRegistration[]>> => {
  const response = await apiClient.get<ApiResponse<EventRegistration[]>>(API_ENDPOINTS.events.registrations, { params });
  return response.data;
};

export const registerForEvent = async (
  data: EventRegistrationPayload
): Promise<ApiResponse<EventRegistration>> => {
  const response = await apiClient.post<ApiResponse<EventRegistration>>(API_ENDPOINTS.events.registrations, data);
  return response.data;
};

export default {
  getEvents,
  getEventBySlug,
  createEvent,
  updateEvent,
  getEventRegistrations,
  registerForEvent,
};
