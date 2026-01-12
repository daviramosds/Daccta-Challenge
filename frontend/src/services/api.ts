import type { Room, CreateRoomDTO, Booking, CreateBookingDTO } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const getRooms = async (): Promise<Room[]> => {
  const response = await fetch(`${API_URL}/rooms`);
  if (!response.ok) throw new Error("Falha ao buscar salas");
  return response.json();
};

export const createRoom = async (data: CreateRoomDTO): Promise<Room> => {
  const response = await fetch(`${API_URL}/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Falha ao criar sala");
  }
  return response.json();
};

export const deleteRoom = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/rooms/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Falha ao deletar sala");
  }
};

export const getBookings = async (
  roomId: string,
  date?: string
): Promise<Booking[]> => {
  const url = date
    ? `${API_URL}/rooms/${roomId}/bookings?date=${date}`
    : `${API_URL}/rooms/${roomId}/bookings`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Falha ao buscar agendamentos");
  return response.json();
};

export const createBooking = async (
  data: CreateBookingDTO
): Promise<Booking> => {
  const response = await fetch(`${API_URL}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Falha ao criar agendamento");
  }
  return response.json();
};

export const updateBooking = async (
  id: string,
  data: Omit<CreateBookingDTO, "roomId">
): Promise<Booking> => {
  const response = await fetch(`${API_URL}/bookings/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Falha ao atualizar agendamento");
  }
  return response.json();
};

export const deleteBooking = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/bookings/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Falha ao deletar agendamento");
  }
};
