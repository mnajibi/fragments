// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');
const Fragment = require('../../src/model');

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
      .post('/v1/fragments')
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

  test('Request with "expand" query = 0 should return response with only ids', async () => {
    // create fragment
    await request(app)
      .post('/v1/fragments')
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

  test('using non-existent id should return 404', async () => {
    const res = await request(app)
      .get('/v1/fragments/non-existent-id')
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(404);
  });

  test('using existing id + text/plain should return correct fragment data', async () => {
    const post_res = await request(app)
      .post('/v1/fragments')
      .send('some text')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1');

    const { id: fragmentID } = post_res.body.fragment;

    const res = await request(app)
      .get(`/v1/fragments/${fragmentID}`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.get('Content-Type')).toBe('text/plain');
    expect(res.text).toEqual('some text');
  });

  test('using existing id + text/html should return correct fragment data', async () => {
    const post_res = await request(app)
      .post('/v1/fragments')
      .send('<h2>This is a fragment</h2>')
      .set('Content-Type', 'text/html')
      .auth('user1@email.com', 'password1');

    const { id: fragmentID } = post_res.body.fragment;

    const res = await request(app)
      .get(`/v1/fragments/${fragmentID}`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.get('Content-Type')).toBe('text/html');
    expect(res.text).toEqual('<h2>This is a fragment</h2>');
  });

  test('using existing id + application/json should return correct fragment data', async () => {
    const post_res = await request(app)
      .post('/v1/fragments')
      .send('{"fragment": "This is a fragment"}')
      .set('Content-Type', 'application/json')
      .auth('user1@email.com', 'password1');

    console.log(post_res.body);
    const { id: fragmentID } = post_res.body.fragment;

    const res = await request(app)
      .get(`/v1/fragments/${fragmentID}`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.get('Content-Type')).toBe('application/json');
    expect(JSON.parse(JSON.stringify(res.body))).toEqual(
      JSON.parse('{"fragment": "This is a fragment"}')
    );
  });
});

describe('GET /v1/fragments/:id/info', () => {
  // if the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', async () => {
    const res = await request(app).get('/v1/fragments/someID/hi/info');

    expect(res.statusCode).toBe(401);
  });

  // if wrong username and password pair used, should be forbidden
  test('incorrect credentials are denied', async () => {
    const res = await request(app)
      .get('/v1/fragments/hi/info')
      .auth('invalid@email.com', 'incorrect_password');

    expect(res.statusCode).toBe(401);
  });

  test('using non-existent id would return 404', async () => {
    const res = await request(app)
      .get('/v1/fragments/non-existent-id/info')
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(404);
  });

  test('error other than 404 would return 500', async () => {
    // Mock Fragment.byId to throw an error (other than 404)
    jest.spyOn(Fragment, 'byId').mockRejectedValueOnce(new Error('Some internal error'));

    const res = await request(app)
      .get('/v1/fragments/some-id')
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(500);
    expect(res.body.error.message).toBe('Some internal error');
  });

  test('text/plain: using existing id would return fragment', async () => {
    const post_res = await request(app)
      .post('/v1/fragments')
      .send('some text')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1');

    const { id: fragmentId } = post_res.body.fragment;

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}/info`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect({ fragment: res.body.fragment }).toEqual(
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

  test('application/json: using existing id would return fragment', async () => {
    const post_obj = { fragments: 'hello' };
    const post_res = await request(app)
      .post('/v1/fragments')
      .send(post_obj)
      .set('Content-Type', 'application/json')
      .auth('user1@email.com', 'password1');

    const { id: fragmentId } = post_res.body.fragment;

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}/info`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect({ fragment: res.body.fragment }).toEqual(
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
});

describe('GET /v1/fragments/:id.ext', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/someId/hello.txt').expect(401));

  // if the wrong username/password pair are used, it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/someId/hello.txt')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('using non-existent id would return 404', async () => {
    const res = await request(app)
      .get('/v1/fragments/non-existent-id.txt')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
  });

  test('should be able to convert text/markdown to text/html using .html extension', async () => {
    const markdown = '# How to run this tool';

    const post_res = await request(app)
      .post('/v1/fragments')
      .send(markdown)
      .set('Content-Type', 'text/markdown')
      .auth('user1@email.com', 'password1');

    const { id: fragment_id } = post_res.body.fragment;

    const res = await request(app)
      .get(`/v1/fragments/${fragment_id}.html`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.get('Content-Type').includes('text/html')).toBe(true);
  });

  test('convert text/markdown to text/ext should throw error', async () => {
    const markdown = '# How to run this tool';

    const post_res = await request(app)
      .post('/v1/fragments')
      .send(markdown)
      .set('Content-Type', 'text/markdown')
      .auth('user1@email.com', 'password1');

    const { id: fragment_id } = post_res.body.fragment;

    const res = await request(app)
      .get(`/v1/fragments/${fragment_id}.ext`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(500);
  });
});
