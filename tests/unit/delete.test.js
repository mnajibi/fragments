const request = require('supertest');
const app = require('../../src/app');

describe('DELETE /v1/fragments', () => {
  //unauthenticated request should return 401
  test('unauthenticated requests are denied', () =>
    request(app).delete('/v1/fragments/id').expect(401));

  // if the wrong credentials are used, it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .delete('/v1/fragments/id')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('deleting non-existent fragment should return 404', async () => {
    const res = await request(app).delete('/v1/fragments/id').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
  });

  test('deleting a fragment should return 200', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .send('some text')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1');

    const fragment = postRes.body.fragment;
    const deleteRes = await request(app)
      .delete(`/v1/fragments/${fragment.id}`)
      .auth('user1@email.com', 'password1');

    const getRes = await request(app)
      .get(`/v1/fragments/${fragment.id}`)
      .auth('user1@email.com', 'password1');

    expect(deleteRes.statusCode).toBe(200);
    expect(getRes.statusCode).toBe(404);
  });
});
