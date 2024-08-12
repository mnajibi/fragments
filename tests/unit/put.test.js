const request = require('supertest');

const app = require('../../src/app');

describe('PUT /v1/fragments/:id', () => {
  // unauthenticated request should return 401
  test('unauthenticated requests are denied', () =>
    request(app).put('/v1/fragments/:id').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .put('/v1/fragments/:id')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('authenticated user should be able to send a put request', async () => {
    const post_res = await request(app)
      .post('/v1/fragments')
      .send('This is a fragment')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1');

    const put_res = await request(app)
      .put(`/v1/fragments/${post_res.body.fragment.id}`)
      .send('This is an updated fragment')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1');

    expect(put_res.statusCode).toBe(200);
    expect(put_res.body.fragment.size).toBeGreaterThan(post_res.body.fragment.size);
  });
});
