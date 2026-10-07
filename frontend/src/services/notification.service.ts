import { apiClient, API_ENDPOINTS } from '@/api/axios';
import {
  NotificationItem,
  NotificationListResponse,
  NotificationFilterParams,
  ApiResponse,
} from '@/types';

/**
 * Fetch notifications for the current authenticated user.
 */
export const getNotifications = async (
  params?: NotificationFilterParams
): Promise<ApiResponse<NotificationListResponse>> => {
  const response = await apiClient.get<ApiResponse<NotificationListResponse>>(
    API_ENDPOINTS.notifications.list,
    { params }
  );
  return response.data;
};

/**
 * Get unread notification count for the current authenticated user.
 */
export const getUnreadNotificationCount = async (): Promise<ApiResponse<{ unreadCount: number }>> => {
  const response = await apiClient.get<ApiResponse<{ unreadCount: number }>>(
    API_ENDPOINTS.notifications.unreadCount
  );
  return response.data;
};

/**
 * Mark a single notification as read.
 */
export const markNotificationAsRead = async (
  id: string
): Promise<ApiResponse<NotificationItem>> => {
  const response = await apiClient.patch<ApiResponse<NotificationItem>>(
    API_ENDPOINTS.notifications.markRead(id)
  );
  return response.data;
};

/**
 * Mark all notifications as read for current user.
 */
export const markAllNotificationsAsRead = async (): Promise<ApiResponse<{ modifiedCount: number }>> => {
  const response = await apiClient.patch<ApiResponse<{ modifiedCount: number }>>(
    API_ENDPOINTS.notifications.markAllRead
  );
  return response.data;
};
