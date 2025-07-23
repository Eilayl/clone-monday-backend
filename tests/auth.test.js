const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
require('dotenv').config();

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('GET /auth/getusers', () => {
  beforeEach(async () => {
    await User.deleteMany(); // reset DB
  });

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
    console.log(res.body.message);
    expect(res.body.message).toContain("email: eilaylevi95@gmail.com");
    expect(res.body.message).toContain("signupwithgoogle: true");
    expect(res.body.message).toContain("answer: answer1");
    expect(res.body.message).toContain("answer: answer2");
    expect(res.body.message).toContain("question: question1");
    expect(res.body.message).toContain("question: question2");
    expect(res.body.message).toContain('eilaylevi95@gmail.com');
    //check encryption
  });

  
  //   test('should return 200, users found but dont sign with google (check fields encryption)', async () => {
  //   const newUser = await request(app).post('/auth/signup')
  //     .send({
  //       email: 'itzik@gmail.com',
  //       signupwithgoogle: false,
  //       fields: {
  //         phone: '0535510999',
  //         name: "Eilay",
  //         password:"securedpassword",
  //       },
  //       survey: [
  //         { question: 'question1', answer: 'answer1' },
  //         { question: 'question2', answer: 'answer2' }
  //       ]
  //     });

  //   expect(newUser.status).toBe(200);
  //   expect(newUser.body.message).toBe('User created successfully');

  //   const res = await request(app).get('/auth/getusers');
  //   expect(res.status).toBe(200);
  //   console.log(res.body.message);
  //   // expect(res.body.message).toContain("email: itzik@gmail.com");
  //   expect(res.body.message).toContain("signupwithgoogle: false");
  //   expect(res.body.message).toContain("answer: answer1");
  //   expect(res.body.message).toContain("answer: answer2");
  //   expect(res.body.message).toContain("question: question1");
  //   expect(res.body.message).toContain("question: question2");
  //   expect(res.body.message).toContain("name: Eilay");
  //   expect(res.body.message).toContain("phone: 0535510999");
  //   //check encryption
  // });

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
  })
  
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
})