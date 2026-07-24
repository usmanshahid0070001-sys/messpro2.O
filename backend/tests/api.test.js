import request from 'supertest';
import { app } from '../src/server.js';
import mongoose from 'mongoose';

// Performance threshold (ms)
const RESPONSE_TIME_LIMIT = 500; 

beforeAll(async () => {
    // Connect to test database if needed
    // Usually handled in server.js but you can override here
});

afterAll(async () => {
    // Close DB connection after tests
    await mongoose.connection.close();
});

describe('API Health and Performance Tests', () => {

    it('GET / should return 200 and respond within limit', async () => {
        const start = Date.now();
        const res = await request(app).get('/');
        const duration = Date.now() - start;

        expect(res.statusCode).toBe(200);
        expect(duration).toBeLessThan(RESPONSE_TIME_LIMIT);
    });
    
    // Auth Edge Cases
    describe('Auth Routes Edge Cases', () => {
        it('POST /api/auth/login with missing fields should fail', async () => {
            const start = Date.now();
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: '' }); // missing password
            const duration = Date.now() - start;

            expect(res.statusCode).not.toBe(200);
            expect(duration).toBeLessThan(RESPONSE_TIME_LIMIT);
        });

        it('POST /api/auth/login with wrong credentials should fail', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'wrong@example.com', password: 'wrongpassword' });
            
            expect(res.statusCode).not.toBe(200);
        });
    });

});
