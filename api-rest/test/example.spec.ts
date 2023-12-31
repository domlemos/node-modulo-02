import { expect, test, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'

beforeAll(async () =>{
    await app.ready()
})

afterAll(async () => {
    await app.close()
})

test('o usuario consegue fazer uma transação', async() => {
    await request(app.server)
        .post('/transactions')
        .send({
            title: 'New Transaction',
            amount: 5000,
            type: 'credit'
        })
        .expect(201)        
},1000)
