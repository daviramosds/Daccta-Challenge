import { IsString, IsInt, Min, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateRoomDto {
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString()
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  name: string;

  @IsNotEmpty({ message: 'Capacidade é obrigatória' })
  @IsInt({ message: 'Capacidade deve ser um número inteiro' })
  @Min(1, { message: 'A capacidade deve ser maior que zero' })
  capacity: number;
}
