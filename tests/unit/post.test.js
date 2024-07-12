const request = require('supertest');

const app = require('../../src/app');

describe('POST /v1/fragments', () => {
  // unauthenticated request should return 401
  test('unauthenticated requests are denied', () => request(app).post('/v1/fragments').expect(401));

  //wrong username/password should return 401
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('wrong@email.com', '123').expect(401));

  test('authenticated user should be able to send a post request', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .send('text')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(201);
    expect(res.statusCode).not.toBe(401);
  });

  test('successful responses include all necessary and expected properties: id, created, type, updated, ownerId', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .send('text')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1');

    const fragment = res.body.fragment;

    expect(Object.keys(fragment)).toEqual(['id', 'ownerId', 'created', 'updated', 'type', 'size']);
    expect({ fragment }).toEqual(
      expect.objectContaining({
        fragment: expect.objectContaining({
          id: expect.any(String),
          ownerId: expect.any(String),
          created: expect.any(String),
          updated: expect.any(String),
          type: expect.any(String),
          size: expect.any(Number),
        }),
      })
    );
  });

  test('text/plain: successful response should have correct Location header', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .send('text')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1');

    expect(res.get('Location')).toBe(`${process.env.API_URL}/v1/fragments/${res.body.fragment.id}`);
  });

  test('trying to create a fragment with an unsupported type errors as expected', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .send('text')
      .set('Content-Type', 'unsupported/type')
      .auth('user1@email.com', 'password1');

    expect(res.body.error.code).toBe(415);
    expect(res.body.error.message).toBe('unsupported/type is not supported');
  });

  test('application/json: Successful response should have correct Location header', async () => {
    const post_res = await request(app)
      .post('/v1/fragments')
      .send({ fragments: 'hello users' })
      .set('Content-Type', 'application/json')
      .auth('user1@email.com', 'password1');

    expect(post_res.get('Location')).toBe(
      `${process.env.API_URL}/v1/fragments/${post_res.body.fragment.id}`
    );
  });
});
