import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { getFutureDateString } from './test-helpers';

describe('Rooms (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableCors();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    dataSource = moduleFixture.get(DataSource);
  }, 30000);

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      try {
        await dataSource.query('TRUNCATE TABLE bookings, rooms CASCADE');
        await dataSource.destroy();
      } catch (error) {
        // Ignore
      }
    }
    await app.close();
  }, 10000);

  beforeEach(async () => {
    // Clean database before each test
    try {
      await dataSource.query('TRUNCATE TABLE bookings, rooms CASCADE');
    } catch (error) {
      // Ignore
    }
  });

  describe('Criação de Sala', () => {
    it('deve criar uma sala quando nome e capacidade forem válidos', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/rooms')
        .send({ name: 'Sala de Reunião', capacity: 10 })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Sala de Reunião');
      expect(response.body.capacity).toBe(10);
    });
  });

  describe('Validação de Nome Único', () => {
    it('deve retornar erro ao tentar criar uma sala com um nome que já existe', async () => {
      // Cria primeira sala
      await request(app.getHttpServer())
        .post('/api/rooms')
        .send({ name: 'Sala Única', capacity: 10 })
        .expect(201);

      // Tenta criar sala com mesmo nome
      const response = await request(app.getHttpServer())
        .post('/api/rooms')
        .send({ name: 'Sala Única', capacity: 15 })
        .expect(409);

      expect(response.body.message).toContain('Já existe uma sala com este nome');
    });
  });

  describe('Validação de Capacidade', () => {
    it('deve retornar erro se a capacidade for 0', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/rooms')
        .send({ name: 'Sala Zero', capacity: 0 })
        .expect(400);

      expect(response.body.message).toContain('A capacidade deve ser maior que zero');
    });

    it('deve retornar erro se a capacidade for um número negativo', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/rooms')
        .send({ name: 'Sala Negativa', capacity: -5 })
        .expect(400);

      expect(response.body.message).toContain('A capacidade deve ser maior que zero');
    });

    it('deve retornar erro se a capacidade não for um número inteiro', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/rooms')
        .send({ name: 'Sala Decimal', capacity: 10.5 })
        .expect(400);

      expect(response.body.message).toContain('Capacidade deve ser um número inteiro');
    });
  });

  describe('Exclusão de Sala (Safe Delete)', () => {
    it('deve permitir excluir uma sala que não possui agendamentos futuros', async () => {
      // Cria sala
      const roomResponse = await request(app.getHttpServer())
        .post('/api/rooms')
        .send({ name: 'Sala Vazia', capacity: 10 })
        .expect(201);

      // Deleta sala
      await request(app.getHttpServer())
        .delete(`/api/rooms/${roomResponse.body.id}`)
        .expect(204);
    });

    it('deve impedir a exclusão de uma sala que possui agendamentos futuros', async () => {
      // Cria sala
      const roomResponse = await request(app.getHttpServer())
        .post('/api/rooms')
        .send({ name: 'Sala com Agendamento', capacity: 10 })
        .expect(201);

      const roomId = roomResponse.body.id;

      // Cria agendamento futuro
      const dateStr = getFutureDateString(1);
      await request(app.getHttpServer())
        .post('/api/bookings')
        .send({
          roomId,
          date: dateStr,
          startTime: '10:00',
          endTime: '11:00',
          title: 'Reunião Futura',
        })
        .expect(201);

      // Tenta deletar sala
      const response = await request(app.getHttpServer())
        .delete(`/api/rooms/${roomId}`)
        .expect(409);

      expect(response.body.message).toBe(
        'Não é possível deletar sala com agendamentos futuros',
      );
    });
  });
});
