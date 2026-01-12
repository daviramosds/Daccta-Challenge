import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { getFutureDateString, getPastDateString } from './test-helpers';

describe('Bookings (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let salaA: any;
  let salaB: any;

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

    // Create fresh test rooms for each test
    const responseA = await request(app.getHttpServer())
      .post('/api/rooms')
      .send({ name: 'Sala A', capacity: 10 })
      .expect(201);
    salaA = responseA.body;

    const responseB = await request(app.getHttpServer())
      .post('/api/rooms')
      .send({ name: 'Sala B', capacity: 15 })
      .expect(201);
    salaB = responseB.body;

    // Verify rooms were created with valid IDs
    if (!salaA?.id || !salaB?.id) {
      throw new Error('Failed to create test rooms in beforeEach');
    }
  });

  describe('Validação de Dados Básicos', () => {
    it('deve retornar erro se tentar agendar em uma sala que não existe', async () => {
      const dateStr = getFutureDateString(1);

      const response = await request(app.getHttpServer())
        .post('/api/bookings')
        .send({
          roomId: '00000000-0000-0000-0000-000000000000',
          date: dateStr,
          startTime: '14:00',
          endTime: '15:00',
          title: 'Reunião',
        })
        .expect(400);
    });

    it('deve retornar erro se o horário de término for igual ao horário de início', async () => {
      const dateStr = getFutureDateString(1);

      const response = await request(app.getHttpServer())
        .post('/api/bookings')
        .send({
          roomId: salaA.id,
          date: dateStr,
          startTime: '14:00',
          endTime: '14:00',
          title: 'Reunião',
        })
        .expect(400);
    });

    it('deve retornar erro se o horário de término for anterior ao horário de início', async () => {
      const dateStr = getFutureDateString(1);

      const response = await request(app.getHttpServer())
        .post('/api/bookings')
        .send({
          roomId: salaA.id,
          date: dateStr,
          startTime: '15:00',
          endTime: '14:00',
          title: 'Reunião',
        })
        .expect(400);
    });

    it('deve retornar erro se a data/horário do agendamento for no passado', async () => {
      const dateStr = getPastDateString(1);

      const response = await request(app.getHttpServer())
        .post('/api/bookings')
        .send({
          roomId: salaA.id,
          date: dateStr,
          startTime: '14:00',
          endTime: '15:00',
          title: 'Reunião',
        })
        .expect(400);

      expect(response.body.message).toBe(
        'Não é permitido criar agendamentos no passado',
      );
    });
  });

  describe('Validação de Conflito de Horário (Overlap)', () => {
    it('Cenário 1: deve retornar erro se o novo agendamento começar e terminar dentro de um horário já ocupado', async () => {
      const dateStr = getFutureDateString(1);

      // Cria um agendamento das 14:00 às 15:00 na Sala A
      await request(app.getHttpServer())
        .post('/api/bookings')
        .send({
          roomId: salaA.id,
          date: dateStr,
          startTime: '14:00',
          endTime: '15:00',
          title: 'Agendamento Existente',
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/api/bookings')
        .send({
          roomId: salaA.id,
          date: dateStr,
          startTime: '14:15',
          endTime: '14:45',
          title: 'Conflito - Dentro',
        })
        .expect(409);

      expect(response.body.message).toMatch(/conflit/i);
    });

    it('Cenário 2: deve retornar erro se o novo agendamento começar antes e terminar depois (englobando)', async () => {
      const dateStr = getFutureDateString(1);

      // Cria um agendamento das 14:00 às 15:00 na Sala A
      await request(app.getHttpServer())
        .post('/api/bookings')
        .send({
          roomId: salaA.id,
          date: dateStr,
          startTime: '14:00',
          endTime: '15:00',
          title: 'Agendamento Existente',
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/api/bookings')
        .send({
          roomId: salaA.id,
          date: dateStr,
          startTime: '13:00',
          endTime: '16:00',
          title: 'Conflito - Engloba',
        })
        .expect(409);

      expect(response.body.message).toMatch(/conflit/i);
    });

    it('Cenário 3: deve retornar erro se o horário de início coincidir exatamente com um agendamento existente', async () => {
      const dateStr = getFutureDateString(1);

      // Cria um agendamento das 14:00 às 15:00 na Sala A
      await request(app.getHttpServer())
        .post('/api/bookings')
        .send({
          roomId: salaA.id,
          date: dateStr,
          startTime: '14:00',
          endTime: '15:00',
          title: 'Agendamento Existente',
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/api/bookings')
        .send({
          roomId: salaA.id,
          date: dateStr,
          startTime: '14:00',
          endTime: '16:00',
          title: 'Conflito - Início Igual',
        })
        .expect(409);

      expect(response.body.message).toMatch(/conflit/i);
    });

    it('Cenário 4: deve retornar erro se houver intersecção parcial (começa antes do fim do anterior)', async () => {
      const dateStr = getFutureDateString(1);

      // Cria um agendamento das 14:00 às 15:00 na Sala A
      await request(app.getHttpServer())
        .post('/api/bookings')
        .send({
          roomId: salaA.id,
          date: dateStr,
          startTime: '14:00',
          endTime: '15:00',
          title: 'Agendamento Existente',
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/api/bookings')
        .send({
          roomId: salaA.id,
          date: dateStr,
          startTime: '14:30',
          endTime: '16:00',
          title: 'Conflito - Intersecção',
        })
        .expect(409);

      expect(response.body.message).toMatch(/conflit/i);
    });

    it('deve permitir agendamento imediatamente após o existente (sem overlap)', async () => {
      const dateStr = getFutureDateString(1);

      // Cria um agendamento das 14:00 às 15:00 na Sala A
      await request(app.getHttpServer())
        .post('/api/bookings')
        .send({
          roomId: salaA.id,
          date: dateStr,
          startTime: '14:00',
          endTime: '15:00',
          title: 'Agendamento Existente',
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/api/bookings')
        .send({
          roomId: salaA.id,
          date: dateStr,
          startTime: '15:00',
          endTime: '16:00',
          title: 'Sem Conflito - Depois',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });

    it('deve permitir agendamento imediatamente antes do existente (sem overlap)', async () => {
      const dateStr = getFutureDateString(1);

      // Cria um agendamento das 14:00 às 15:00 na Sala A
      await request(app.getHttpServer())
        .post('/api/bookings')
        .send({
          roomId: salaA.id,
          date: dateStr,
          startTime: '14:00',
          endTime: '15:00',
          title: 'Agendamento Existente',
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/api/bookings')
        .send({
          roomId: salaA.id,
          date: dateStr,
          startTime: '13:00',
          endTime: '14:00',
          title: 'Sem Conflito - Antes',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });
  });

  describe('Permissão de Horários Simultâneos (Salas Diferentes)', () => {
    it('deve permitir criar um agendamento no mesmo horário de outro, desde que seja em uma sala diferente', async () => {
      const dateStr = getFutureDateString(1);

      // Cria agendamento na Sala A
      await request(app.getHttpServer())
        .post('/api/bookings')
        .send({
          roomId: salaA.id,
          date: dateStr,
          startTime: '14:00',
          endTime: '15:00',
          title: 'Reunião Sala A',
        })
        .expect(201);

      // Cria agendamento no mesmo horário na Sala B
      const response = await request(app.getHttpServer())
        .post('/api/bookings')
        .send({
          roomId: salaB.id,
          date: dateStr,
          startTime: '14:00',
          endTime: '15:00',
          title: 'Reunião Sala B',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.roomId).toBe(salaB.id);
    });
  });

  describe('Listagem e Filtros', () => {
    it('deve listar os agendamentos de uma sala específica filtrados por data', async () => {
      const date1 = getFutureDateString(1);
      const date2 = getFutureDateString(2);

      // Cria agendamentos em datas diferentes
      await request(app.getHttpServer())
        .post('/api/bookings')
        .send({
          roomId: salaA.id,
          date: date1,
          startTime: '10:00',
          endTime: '11:00',
          title: 'Reunião Dia 1',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/bookings')
        .send({
          roomId: salaA.id,
          date: date2,
          startTime: '10:00',
          endTime: '11:00',
          title: 'Reunião Dia 2',
        })
        .expect(201);

      // Lista apenas do dia 1
      const response = await request(app.getHttpServer())
        .get(`/api/rooms/${salaA.id}/bookings?date=${date1}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Reunião Dia 1');
    });

    it('deve garantir que a lista esteja ordenada cronologicamente', async () => {
      const dateStr = getFutureDateString(1);

      // Cria agendamentos em ordem aleatória
      await request(app.getHttpServer())
        .post('/api/bookings')
        .send({
          roomId: salaA.id,
          date: dateStr,
          startTime: '16:00',
          endTime: '17:00',
          title: 'Terceiro',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/bookings')
        .send({
          roomId: salaA.id,
          date: dateStr,
          startTime: '10:00',
          endTime: '11:00',
          title: 'Primeiro',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/bookings')
        .send({
          roomId: salaA.id,
          date: dateStr,
          startTime: '14:00',
          endTime: '15:00',
          title: 'Segundo',
        })
        .expect(201);

      // Lista e verifica ordem
      const response = await request(app.getHttpServer())
        .get(`/api/rooms/${salaA.id}/bookings?date=${dateStr}`)
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0].title).toBe('Primeiro');
      expect(response.body[1].title).toBe('Segundo');
      expect(response.body[2].title).toBe('Terceiro');
    });

    it('deve retornar uma lista vazia se não houver agendamentos na data', async () => {
      const dateStr = getFutureDateString(30);

      const response = await request(app.getHttpServer())
        .get(`/api/rooms/${salaA.id}/bookings?date=${dateStr}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });
});

