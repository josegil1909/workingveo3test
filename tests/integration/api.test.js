import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { app } from '../../server.js';

describe('API server', () => {
  it('responde OK en /api/health', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'ok' });
    expect(response.body).toHaveProperty('timestamp');
  });

  it('valida cuerpo en /api/generate', async () => {
    const response = await request(app)
      .post('/api/generate')
      .send({ script: 'Muy corto' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('valida campos requeridos en /api/generate-continuation', async () => {
    const response = await request(app)
      .post('/api/generate-continuation')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('valida lista de segmentos en /api/generate-videos', async () => {
    const response = await request(app)
      .post('/api/generate-videos')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('valida cuerpo en /api/generate-plus', async () => {
    const response = await request(app)
      .post('/api/generate-plus')
      .send({ script: 'Muy corto' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('valida cuerpo en /api/generate-new-cont', async () => {
    const response = await request(app)
      .post('/api/generate-new-cont')
      .send({ script: 'Muy corto' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('descarga ZIP en /api/download', async () => {
    const response = await request(app)
      .post('/api/download')
      .send({ segments: [{ id: 1, text: 'demo' }] })
      .buffer()
      .parse((res, callback) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => callback(null, Buffer.concat(chunks)));
      });

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('application/zip');
    expect(response.headers['content-disposition']).toContain('veo3-segments.zip');
    expect(response.body.length).toBeGreaterThan(0);
  });
});
