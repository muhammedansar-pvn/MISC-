export type NotificationType =
  | 'EXAM_PUBLISHED'
  | 'EXAM_REGISTRATION'
  | 'PAYMENT_SUCCESS'
  | 'HALL_TICKET'
  | 'LEAVE_SUBMITTED'
  | 'LEAVE_APPROVED'
  | 'LEAVE_REJECTED'
  | 'RESULT_PUBLISHED'
  | 'ATTENDANCE_WARNING'
  | 'TIMETABLE_ASSIGNED'
  | 'TIMETABLE_UPDATED'
  | 'SYSTEM_ALERT';

export interface NotificationItem {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  readAt?: string | null;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NotificationListResponse {
  notifications: NotificationItem[];
  pagination: NotificationPagination;
  unreadCount: number;
}

export interface NotificationFilterParams {
  page?: number;
  limit?: number;
  type?: NotificationType;
  isRead?: boolean;
}
