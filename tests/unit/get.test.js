// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  test('Request with "expand" query should return expanded response', async () => {
    // create fragment
    await request(app)
      .post('v1/fragments')
      .send('some text')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1');

    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');

    //checking first element of the response
    const fragment0 = res.body.fragments[0];
    expect({ fragment0 }).toEqual(
      expect.objectContaining({
        fragment0: expect.objectContaining({
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

  test('request with "expand" query = 0 should return response with only ids', async () => {
    // create fragment
    await request(app)
      .post('v1/fragments')
      .send('some text')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1');

    const res = await request(app)
      .get('/v1/fragments?expand=0')
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
    expect(typeof res.body.fragments[0]).toBe('string');
  });
});

describe('GET /v1/fragments/:id', () => {
  // if the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', async () => {
    const res = await request(app).get('/v1/fragments/hi');

    expect(res.statusCode).toBe(401);
  });

  // if wrong username and password pair used, should be forbidden
  test('incorrect credentials are denied', async () => {
    const res = await request(app)
      .get('/v1/fragments/hi')
      .auth('invalid@email.com', 'incorrect_password');

    expect(res.statusCode).toBe(401);
  });

  test('using non-existent id would return 404', async () => {
    const res = await request(app)
      .get('/v1/fragments/non-existent-id')
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(404);
  });

  test('using existing id would return fragment', async () => {
    const post_res = await request(app)
      .post('/v1/fragments')
      .send('some text')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1');

    const { fragment } = post_res.body;

    const res = await request(app)
      .get(`/v1/fragments/${fragment.id}`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual('some text');
  });
});
