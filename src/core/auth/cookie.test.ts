import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import cookie from './cookie';

const app = express();
app.use(cookieParser());
app.use(express.json());

// Mock route to test setCookie
app.post('/set-cookie', (req, res) => {
    const { name, value, diasDuracao } = req.body;
    cookie.setCookie(res, name, value, diasDuracao);
    res.status(200).send('Cookie set');
});

// Mock route to test expireCookie
app.post('/expire-cookie', (req, res) => {
    const { name } = req.body;
    cookie.expireCookie(res, name);
    res.status(200).send('Cookie expired');
});

describe('Testes de manipulação de cookies do modulo cookie.ts', () => {

    test('Testando setagem do cookie', async () => {
        
        const response = await request(app)
            .post('/set-cookie')
            .send({ name: 'testCookie', value: 'testValue', diasDuracao: 7 });

        expect(response.status).toBe(200);
        const setCookieHeader = response.headers['set-cookie'][0];
        
        expect(setCookieHeader).toContain('testCookie=testValue');
        expect(setCookieHeader).toContain('Path=/;');
        expect(setCookieHeader).toContain('Max-Age=604800;'); 

    });

    test('Testando expiração do cookie', async () => {
        const response = await request(app)
            .post('/expire-cookie')
            .send({ name: 'testCookie' });

        expect(response.status).toBe(200);
        const setCookieHeader = response.headers['set-cookie'][0];

        expect(setCookieHeader).toContain('testCookie=');
        expect(setCookieHeader).toContain('Max-Age=0');
    
    });

});