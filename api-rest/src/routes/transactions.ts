import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { number, z } from 'zod'
import { randomUUID } from "crypto";
import { checkSessionIdExsists } from "../middlewares/checkSessionIdExists";

export async function transactionsRoutes(app: FastifyInstance) {    
    app.get('/', {
      preHandler: [
        checkSessionIdExsists
      ]} ,async (request, response) => {

      const { sessionId } = request.cookies

      const transactions = await knex('transactions')
      .where({        
        'session_id': sessionId,
      })
      .select()
      return {
        transactions
      }
    })

    app.get('/:id', {
      preHandler: [
        checkSessionIdExsists
      ]} , async (request) => {
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { sessionId } = request.cookies

      const { id } = getTransactionParamsSchema.parse(request.params)

      const transatction = knex('transactions').where({
        id,
        'session_id': sessionId
      }).first()

      return transatction
    })

    app.get('/summary',  {
      preHandler: [
        checkSessionIdExsists
      ]} ,async(request, response) => {

      const { sessionId } = request.cookies

      const summary = await knex('transactions')
      .sum('amount', { as: 'amount'}).where({
        'session_id': sessionId
      })
      .first()

      return summary
    })

    app.post("/", async (request, response) => {
      const createTransactionBodySchema = z.object({
          title: z.string(),
          amount:  number(),
          type: z.enum(['credit', 'debt'])
         })

         const { title, amount, type } = createTransactionBodySchema.parse(request.body)

         let sessionId = request.cookies.sessionId

         if(!sessionId) {
          sessionId = randomUUID() 
          response.cookie('sessionId', sessionId, {
            path: '/',
            maxAge: 1000 * 60 * 24* 7 // 7 dias
          })
         }

         await knex('transactions').insert({
           id: crypto.randomUUID(),
           title,
           amount: type === 'credit' ? amount : amount * -1,
           session_id: sessionId,
         })

         return response.status(201).send()
       });
}
