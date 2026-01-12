export interface Room {
  id: string;
  name: string;
  capacity: number;
  createdAt: string;
}

export interface Booking {
  id: string;
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  createdAt: string;
  room?: Room;
}

export interface CreateRoomDTO {
  name: string;
  capacity: number;
}

export interface CreateBookingDTO {
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
}
