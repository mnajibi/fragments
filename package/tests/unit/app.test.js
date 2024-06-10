const request = require('supertest');

const app = require('../../src/app');

describe('src/app.js', () => {
  test('Handle 404 not found request', async () => {
    const res = await request(app).get('/v1/not-found').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
    expect(typeof res.body.error).toBe('object');
    expect(res.body.error.message).toBe('not found');
    expect(res.body.error.code).toBe(404);
  });
});
