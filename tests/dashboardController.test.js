const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../app');
const User = require('../models/User');
const Dashboard = require('../models/Dashboard');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

beforeEach(async () => {
    await User.deleteMany();
    await Dashboard.deleteMany();
});

describe('POST /dashboard/additem', () => {
    test('should return 401 when user is not logged in', async () => {
        const res = await request(app).post('/dashboard/additem')
            .send({ name: "dashboard" });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe("User not authenticated");
    });

    test('should return 400 when name is missing', async () => {
        const signupRes = await request(app).post('/auth/signup').send({
            email: 'test@example.com',
            signupwithgoogle: true,
            fields: null,
            survey: [
                { question: 'question1', answer: 'answer1' },
                { question: 'question2', answer: 'answer2' }
            ]
        });

        expect(signupRes.status).toBe(200);
        const cookie = signupRes.headers['set-cookie'];

        const res = await request(app)
            .post('/dashboard/additem')
            .set('Cookie', cookie)
            .send({}); // missing name

        expect(res.status).toBe(404);
        expect(res.body.error).toBe("Name is not exists");
    });

})
    test('should return 200 + 2 items into dashboard', async () => {
        const signup = await request(app).post('/auth/signup').send({
            email: 'test@example.com',
            signupwithgoogle: true,
            fields: null,
            survey: [
                { question: 'question1', answer: 'answer1' },
                { question: 'question2', answer: 'answer2' }
            ]
        });

        const cookie = signup.headers['set-cookie'];
        
        const firstItem = await request(app).post('/dashboard/additem')
        .set('Cookie', cookie)
        .send({name: "Dashboard 1"});

        
        const secondItem = await request(app).post('/dashboard/additem')
        .set('Cookie', cookie)
        .send({name: "Dashboard 2"});

        const getItems = await request(app).post('/dashboard/getitems')
        .set('Cookie', cookie)
        .send({});

        expect(getItems.status).toBe(200);
});
