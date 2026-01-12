import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { RoomsService } from '../rooms/rooms.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private roomsService: RoomsService,
  ) { }

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const { roomId, date, startTime, endTime, title } = createBookingDto;

    const room = await this.roomsService.findOne(roomId).catch(() => null);
    if (!room) {
      throw new BadRequestException('Sala não encontrada');
    }

    if (endTime <= startTime) {
      throw new BadRequestException(
        'Horário de término deve ser maior que o de início',
      );
    }

    const [year, month, day] = date.split('-').map(Number);
    const bookingDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      throw new BadRequestException(
        'Não é permitido criar agendamentos no passado',
      );
    }

    await this.checkConflicts(roomId, date, startTime, endTime);

    const booking = this.bookingRepository.create({
      roomId,
      date: new Date(date),
      startTime,
      endTime,
      title,
    });

    return await this.bookingRepository.save(booking);
  }

  async findByRoomAndDate(
    roomId: string,
    date?: string,
  ): Promise<Booking[]> {
    await this.roomsService.findOne(roomId);

    const queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.room', 'room')
      .where('booking.room_id = :roomId', { roomId });

    if (date) {
      const dateObj = new Date(date);
      dateObj.setHours(0, 0, 0, 0);
      const nextDay = new Date(dateObj);
      nextDay.setDate(nextDay.getDate() + 1);

      queryBuilder.andWhere('booking.date >= :startDate AND booking.date < :endDate', {
        startDate: dateObj,
        endDate: nextDay
      });
    }

    return await queryBuilder
      .orderBy('booking.date', 'ASC')
      .addOrderBy('booking.start_time', 'ASC')
      .getMany();
  }

  async update(
    id: string,
    updateBookingDto: UpdateBookingDto,
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({ where: { id } });

    if (!booking) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    const { date, startTime, endTime, title } = updateBookingDto;

    if (endTime <= startTime) {
      throw new BadRequestException(
        'Horário de término deve ser maior que o de início',
      );
    }

    const [year, month, day] = date.split('-').map(Number);
    const bookingDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      throw new BadRequestException(
        'Não é permitido atualizar agendamento para uma data passada',
      );
    }

    await this.checkConflicts(booking.roomId, date, startTime, endTime, id);

    booking.date = new Date(date);
    booking.startTime = startTime;
    booking.endTime = endTime;
    booking.title = title;

    return await this.bookingRepository.save(booking);
  }

  async remove(id: string): Promise<void> {
    const booking = await this.bookingRepository.findOne({ where: { id } });

    if (!booking) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    await this.bookingRepository.remove(booking);
  }

  private async checkConflicts(
    roomId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeId?: string,
  ): Promise<void> {
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    const queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.room_id = :roomId', { roomId })
      .andWhere('DATE(booking.date) = DATE(:date)', { date: dateObj })
      .andWhere('booking.start_time < :endTime', { endTime })
      .andWhere('booking.end_time > :startTime', { startTime });

    if (excludeId) {
      queryBuilder.andWhere('booking.id != :id', { id: excludeId });
    }

    const conflicts = await queryBuilder.getMany();

    if (conflicts.length > 0) {
      throw new ConflictException(
        'Este horário conflita com um agendamento existente',
      );
    }
  }
}
