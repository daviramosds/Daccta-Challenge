import { IsString, IsNotEmpty, MaxLength, Matches } from 'class-validator';

export class UpdateBookingDto {
  @IsNotEmpty({ message: 'Data é obrigatória' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Data deve estar no formato YYYY-MM-DD',
  })
  date: string;

  @IsNotEmpty({ message: 'Horário de início é obrigatório' })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Horário de início deve estar no formato HH:mm',
  })
  startTime: string;

  @IsNotEmpty({ message: 'Horário de término é obrigatório' })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Horário de término deve estar no formato HH:mm',
  })
  endTime: string;

  @IsNotEmpty({ message: 'Título é obrigatório' })
  @IsString()
  @MaxLength(200, { message: 'Título deve ter no máximo 200 caracteres' })
  title: string;
}
