const request = require('supertest');

const app = require('../../src/app');
const fs = require('fs');
const path = require('path');

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  test('request with "expand" query should return expanded response', async () => {
    // create a fragment first
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

    // checking first element of the response
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

  test('request with "expand" query = 0 should return reponse with only ids', async () => {
    // create a fragment first
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

  describe('GET /v1/fragments/:id', () => {
    // If the request is missing the Authorization header, it should be forbidden
    test('unauthenticated requests are denied', () =>
      request(app).get('/v1/fragments/hello').expect(401));

    // If the wrong username/password pair are used (no such user), it should be forbidden
    test('incorrect credentials are denied', () =>
      request(app)
        .get('/v1/fragments/hello')
        .auth('invalid@email.com', 'incorrect_password')
        .expect(401));

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

      const { id: fragment_id } = post_res.body.fragment;

      const res = await request(app)
        .get(`/v1/fragments/${fragment_id}`)
        .auth('user1@email.com', 'password1');

      expect(res.statusCode).toBe(200);
      expect(res.get('Content-Type')).toBe('text/plain');
      expect(res.text).toEqual('some text');
    });

    test('using existing id + text/html should return correct fragment data', async () => {
      const post_res = await request(app)
        .post('/v1/fragments')
        .send('<h2>This is a fragment<h2>')
        .set('Content-Type', 'text/html')
        .auth('user1@email.com', 'password1');

      const { id: fragment_id } = post_res.body.fragment;

      const res = await request(app)
        .get(`/v1/fragments/${fragment_id}`)
        .auth('user1@email.com', 'password1');

      expect(res.statusCode).toBe(200);
      expect(res.get('Content-Type')).toBe('text/html');
      expect(res.text).toEqual('<h2>This is a fragment<h2>');
    });

    test('using existing id + application/json should return correct fragment data', async () => {
      const post_res = await request(app)
        .post('/v1/fragments')
        .send('{"fragment": "This is a fragment"}')
        .set('Content-Type', 'application/json')
        .auth('user1@email.com', 'password1');

      console.log(post_res.body);
      const { id: fragment_id } = post_res.body.fragment;

      const res = await request(app)
        .get(`/v1/fragments/${fragment_id}`)
        .auth('user1@email.com', 'password1');

      expect(res.statusCode).toBe(200);
      expect(res.get('Content-Type')).toBe('application/json');
      expect(res.body).toEqual({ fragment: 'This is a fragment' });
    });
  });

  describe('GET /v1/fragments/:id/info', () => {
    // If the request is missing the Authorization header, it should be forbidden
    test('unauthenticated requests are denied', () =>
      request(app).get('/v1/fragments/an-id/hello/info').expect(401));

    // If the wrong username/password pair are used (no such user), it should be forbidden
    test('incorrect credentials are denied', () =>
      request(app)
        .get('/v1/fragments/an-id/hello/info')
        .auth('invalid@email.com', 'incorrect_password')
        .expect(401));

    test('using non-existent id would return 404', async () => {
      const res = await request(app)
        .get('/v1/fragments/non-existent-id/info')
        .auth('user1@email.com', 'password1');

      expect(res.statusCode).toBe(404);
    });
    test('using existing id + text/plain type should return correct fragment', async () => {
      const post_res = await request(app)
        .post('/v1/fragments')
        .send('some text')
        .set('Content-Type', 'text/plain')
        .auth('user1@email.com', 'password1');

      const { id: fragment_id } = post_res.body.fragment;

      const res = await request(app)
        .get(`/v1/fragments/${fragment_id}/info`)
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
    test('using existing id + applcation/json type should return correct fragment', async () => {
      const post_obj = { fragments: 'Is fun' };
      const post_res = await request(app)
        .post('/v1/fragments')
        .send(post_obj)
        .set('Content-Type', 'application/json')
        .auth('user1@email.com', 'password1');

      const { id: fragment_id } = post_res.body.fragment;

      const res = await request(app)
        .get(`/v1/fragments/${fragment_id}/info`)
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

  // NOTE: for POST image and conversion, we'll use integration Hurl
  describe('GET /v1/fragments/:id.ext', () => {
    // If the request is missing the Authorization header, it should be forbidden
    test('unauthenticated requests are denied', () =>
      request(app).get('/v1/fragments/an-id/hello.txt').expect(401));

    // If the wrong username/password pair are used (no such user), it should be forbidden
    test('incorrect credentials are denied', () =>
      request(app)
        .get('/v1/fragments/an-id/hello.txt')
        .auth('invalid@email.com', 'incorrect_password')
        .expect(401));

    test('using non-existent id would return 404', async () => {
      const res = await request(app)
        .get('/v1/fragments/non-existent-id.txt')
        .auth('user1@email.com', 'password1');

      expect(res.statusCode).toBe(404);
    });

    test('should be able to convert text/markdown to .txt', async () => {
      const post_res = await request(app)
        .post('/v1/fragments')
        .send('This is a fragment')
        .set('Content-Type', 'text/markdown')
        .auth('user1@email.com', 'password1');

      const { id: fragment_id } = post_res.body.fragment;

      const res = await request(app)
        .get(`/v1/fragments/${fragment_id}.txt`)
        .auth('user1@email.com', 'password1');

      expect(res.statusCode).toBe(200);
      expect(res.get('Content-Type').includes('text/plain')).toBe(true);
    });

    test('should not be able to convert unsupported types', async () => {
      const markdown = `# How run this tool`;

      const post_res = await request(app)
        .post('/v1/fragments')
        .send(markdown)
        .set('Content-Type', 'text/markdown')
        .auth('user1@email.com', 'password1');

      const { id: fragment_id } = post_res.body.fragment;

      const get_res = await request(app)
        .get(`/v1/fragments/${fragment_id}.css`)
        .auth('user1@email.com', 'password1');
      expect(get_res.statusCode).toBe(400);
    });

    test('should be able to convert text/markdown to .html, .md, .txt', async () => {
      const markdown = `# How run this tool`;

      const post_res = await request(app)
        .post('/v1/fragments')
        .send(markdown)
        .set('Content-Type', 'text/markdown')
        .auth('user1@email.com', 'password1');

      const { id: fragment_id } = post_res.body.fragment;

      const res1 = await request(app)
        .get(`/v1/fragments/${fragment_id}.html`)
        .auth('user1@email.com', 'password1');

      const res2 = await request(app)
        .get(`/v1/fragments/${fragment_id}.md`)
        .auth('user1@email.com', 'password1');

      const res3 = await request(app)
        .get(`/v1/fragments/${fragment_id}.txt`)
        .auth('user1@email.com', 'password1');

      expect(res1.statusCode).toBe(200);
      expect(res1.get('Content-Type').includes('text/html')).toBe(true);
      expect(res2.statusCode).toBe(200);
      expect(res2.get('Content-Type').includes('text/markdown')).toBe(true);
      expect(res3.statusCode).toBe(200);
      expect(res3.get('Content-Type').includes('text/plain')).toBe(true);
    });

    test('Invalid mime_type with extension error', async () => {
      const invalidExt = 'invalid';
      const get_res = await request(app)
        .get(`/v1/fragments/id.${invalidExt}`)
        .auth('user1@email.com', 'password1');

      expect(get_res.statusCode).toBe(404);
      expect(get_res.body.error.message).toBe(`Invalid mime_type with extension .${invalidExt}`);
    });
  });

  describe('convert Image', () => {
    test('Should be able to convert png to jpg', async () => {
      // Get the absolute path to the image file
      const imagePath = path.join(__dirname, '../integration/cat.png');

      // Read the image file as a Buffer
      const catPNG = fs.readFileSync(imagePath);
      const post_res = await request(app)
        .post('/v1/fragments')
        .send(catPNG)
        .set('Content-Type', 'image/png')
        .auth('user1@email.com', 'password1');

      const { id: fragment_id } = post_res.body.fragment;

      const get_res = await request(app)
        .get(`/v1/fragments/${fragment_id}.jpg`)
        .auth('user1@email.com', 'password1');

      expect(get_res.statusCode).toBe(200);
    });

    test('Should not be able to convert from txt to jpg', async () => {
      const text = `How run this tool`;
      const post_res = await request(app)
        .post('/v1/fragments')
        .send(text)
        .set('Content-Type', 'text/plain')
        .auth('user1@email.com', 'password1');

      const { id: fragment_id } = post_res.body.fragment;

      const get_res = await request(app)
        .get(`/v1/fragments/${fragment_id}.jpg`)
        .auth('user1@email.com', 'password1');

      expect(get_res.statusCode).toBe(400);
      expect(get_res.body.error.message).toBe('Can\'t convert "text/plain" to ".jpg');
    });

    test('convert json to txt', async () => {
      const post_res = await request(app)
        .post('/v1/fragments')
        .send('{"fragment": "This is a fragment"}')
        .set('Content-Type', 'application/json')
        .auth('user1@email.com', 'password1');

      console.log(post_res.body);
      const { id: fragment_id } = post_res.body.fragment;

      const res = await request(app)
        .get(`/v1/fragments/${fragment_id}.txt`)
        .auth('user1@email.com', 'password1');

      expect(res.statusCode).toBe(200);
    });
  });
});
