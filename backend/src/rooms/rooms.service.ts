import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Room } from './entities/room.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) { }

  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    const { name, capacity } = createRoomDto;

    const existingRoom = await this.roomRepository.findOne({ where: { name } });
    if (existingRoom) {
      throw new ConflictException('Já existe uma sala com este nome');
    }

    const room = this.roomRepository.create({ name, capacity });
    return await this.roomRepository.save(room);
  }

  async findAll(): Promise<Room[]> {
    return await this.roomRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Room> {
    const room = await this.roomRepository.findOne({ where: { id } });
    if (!room) {
      throw new NotFoundException('Sala não encontrada');
    }
    return room;
  }

  async remove(id: string): Promise<void> {
    const room = await this.findOne(id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureBookings = await this.bookingRepository.count({
      where: {
        roomId: id,
        date: MoreThanOrEqual(today),
      },
    });

    if (futureBookings > 0) {
      throw new ConflictException(
        'Não é possível deletar sala com agendamentos futuros',
      );
    }

    await this.roomRepository.remove(room);
  }
}
