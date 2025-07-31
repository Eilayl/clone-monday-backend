const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany(); // reset DB before each test
});

describe('GET /auth/getusers', () => {
  test('should return 404, users not found', async () => {
    const res = await request(app).get('/auth/getusers');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('No users found');
  });

  test('should return 200, users found', async () => {
    const newUser = await request(app).post('/auth/signup')
      .send({
        email: 'eilaylevi95@gmail.com',
        signupwithgoogle: true,
        fields: null,
        survey: [
          { question: 'question1', answer: 'answer1' },
          { question: 'question2', answer: 'answer2' }
        ]
      });

    expect(newUser.status).toBe(200);
    expect(newUser.body.message).toBe('User created successfully');

    const res = await request(app).get('/auth/getusers');
    expect(res.status).toBe(200);

    const message = res.body.message.join('\n');

    expect(message).toContain("email: eilaylevi95@gmail.com");
    expect(message).toContain("signupwithgoogle: true");
    expect(message).toContain("question: question1");
    expect(message).toContain("answer: answer1");
    expect(message).toContain("question: question2");
    expect(message).toContain("answer: answer2");
  });

  test('should return 200, users found but don’t sign with Google (check fields encryption)', async () => {
    const newUser = await request(app).post('/auth/signup')
      .send({
        email: 'itzik@gmail.com',
        signupwithgoogle: false,
        fields: {
          phone: '0535510999',
          name: 'Eilay',
          password: 'securedpassword',
        },
        survey: [
          { question: 'question1', answer: 'answer1' },
          { question: 'question2', answer: 'answer2' }
        ]
      });

    expect(newUser.status).toBe(200);
    expect(newUser.body.message).toBe('User created successfully');

    const res = await request(app).get('/auth/getusers');
    expect(res.status).toBe(200);

    const message = res.body.message.join('\n');

    expect(message).toContain("signupwithgoogle: false");
    expect(message).toContain("phone: 0535510999");
    expect(message).toContain("name: Eilay");
    expect(message).toContain("question: question1");
    expect(message).toContain("answer: answer1");
    expect(message).toContain("question: question2");
    expect(message).toContain("answer: answer2");
  });
});

describe('POST /auth/signup', () => {
  test('returns 404 when fields is null and not signing up with Google', async () => {
    const newUser = await request(app).post('/auth/signup')
      .send({
        email: 'eilaylevi95@gmail.com',
        signupwithgoogle: false,
        fields: null,
        survey: [
          { question: 'question1', answer: 'answer1' },
          { question: 'question2', answer: 'answer2' }
        ]
      });

    expect(newUser.status).toBe(404);
    expect(newUser.body.message).toBe('Fields are required when not signing up with Google');
  });

  test('returns 400 when email is not provided', async () => {
    const newUser = await request(app).post('/auth/signup')
      .send({
        signupwithgoogle: true,
        fields: null,
        survey: [
          { question: 'question1', answer: 'answer1' },
          { question: 'question2', answer: 'answer2' }
        ]
      });

    expect(newUser.status).toBe(400);
    expect(newUser.body.message).toBe('Email is required when signing up with Google');
  });
});
