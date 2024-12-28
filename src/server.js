/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import { corsOptions } from './config/cors'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import exitHook from 'async-exit-hook'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'
import cookieParser from 'cookie-parser'

const START_SERVER = () => {
  const app = express()

  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  app.use(cookieParser())

  app.use(cors(corsOptions))

  // Enable req.body json data
  app.use(express.json())

  // Use APIs_V1
  app.use('/v1', APIs_V1)

  // Middleware error handling
  app.use(errorHandlingMiddleware)

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(
      `3. Hi ${env.AUTHOR}, server running at http://${env.APP_HOST}:${env.APP_PORT}/`
    )
  })

  // Thực hiện các tác vụ cleanup trước khi thoát ứng dụng
  exitHook(() => {
    console.log('4. Sever is shutting down...')
    CLOSE_DB()
    console.log('5. Disconnected to MongoDB Cloud Atlas...')
  })
}

//  Chỉ khi kết nối tới database thành công thì mới Start Server Back-end lên. Dùng IIFE
;(async () => {
  try {
    console.log('1. Connecting to MongoDB Cloud Atlas...')
    await CONNECT_DB()
    console.log('2. Connected to MongoDB Cloud Atlas!')
    START_SERVER()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()
