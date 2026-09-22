export interface EventItem {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  eventDate?: string;
  startDate?: string;
  endDate?: string;
  venue?: string;
  eventType?: string;
  status: string;
  isRegistrationOpen?: boolean;
  registrationRequired?: boolean;
  registrationFee?: number;
  maxParticipants?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type EventModel = EventItem;

export interface EventPayload {
  title: string;
  slug?: string;
  description?: string;
  eventDate?: string;
  startDate?: string;
  endDate?: string;
  venue?: string;
  eventType?: string;
  status?: string;
  isRegistrationOpen?: boolean;
  registrationRequired?: boolean;
  registrationFee?: number;
  maxParticipants?: number;
}

export interface EventRegistration {
  _id: string;
  eventId?: string | EventItem;
  userId?: string | any;
  participantName?: string;
  name?: string;
  email: string;
  phone?: string;
  institution?: string;
  registrationNumber?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventRegistrationPayload {
  eventId: string;
  name?: string;
  participantName?: string;
  email: string;
  phone?: string;
  institution?: string;
}
