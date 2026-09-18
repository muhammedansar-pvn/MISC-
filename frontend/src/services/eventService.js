import apiClient from '../api/axios';

export const getEvents = async (params = {}) => {
  const response = await apiClient.get('/events/events', { params });
  return response.data;
};

export const getEventBySlug = async (slug) => {
  const response = await apiClient.get(`/events/events/${slug}`);
  return response.data;
};

export const createEvent = async (data) => {
  const response = await apiClient.post('/events/events', data);
  return response.data;
};

export const updateEvent = async (id, data) => {
  const response = await apiClient.put(`/events/events/${id}`, data);
  return response.data;
};

export const getEventRegistrations = async (params = {}) => {
  const response = await apiClient.get('/events/event-registrations', { params });
  return response.data;
};

export const registerForEvent = async (data) => {
  const response = await apiClient.post('/events/event-registrations', data);
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
