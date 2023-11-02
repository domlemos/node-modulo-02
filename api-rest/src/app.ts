import fastify from "fastify";

import { transactionsRoutes } from "./routes/transactions";
import cookie from '@fastify/cookie'

export const app = fastify();

app.register(cookie)

app.addHook('preHandler', async (request, response) => {
  console.log(`[${request.method}]`)
})
app.register(transactionsRoutes, {
  prefix: 'transactions'
})
