import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@ApiTags('bookings')
@Controller('api')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) { }

  @Post('bookings')
  @ApiOperation({ summary: 'Criar um novo agendamento' })
  @ApiResponse({ status: 201, description: 'Agendamento criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou sala não encontrada' })
  @ApiResponse({ status: 409, description: 'Conflito de horário' })
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @Get('rooms/:roomId/bookings')
  @ApiOperation({ summary: 'Listar agendamentos de uma sala' })
  @ApiQuery({ name: 'date', required: false, description: 'Filtrar por data (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Lista de agendamentos retornada com sucesso' })
  @ApiResponse({ status: 404, description: 'Sala não encontrada' })
  findByRoomAndDate(
    @Param('roomId') roomId: string,
    @Query('date') date?: string,
  ) {
    return this.bookingsService.findByRoomAndDate(roomId, date);
  }

  @Put('bookings/:id')
  @ApiOperation({ summary: 'Atualizar um agendamento' })
  @ApiResponse({ status: 200, description: 'Agendamento atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  @ApiResponse({ status: 409, description: 'Conflito de horário' })
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Delete('bookings/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir um agendamento' })
  @ApiResponse({ status: 204, description: 'Agendamento excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }
}
