/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import exitHook from 'async-exit-hook'
import cookieParser from 'cookie-parser'
import http from 'http'
import socketIo from 'socket.io'

import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { corsOptions } from './config/cors'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'
import { inviteUserToBoardSocket } from './sockets/inviteUserToBoardSocket'

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

  // Tạo server bọc thằng app của express để làm real-time với socket.io
  const server = http.createServer(app)

  // Khởi tạo biến io với server và cors
  const io = socketIo(server, {
    cors: corsOptions
  })

  io.on('connection', (socket) => {
    inviteUserToBoardSocket(socket)
  })

  if (env.BUILD_MODE === 'production') {
    server.listen(process.env.PORT, () => {
      console.log(
        `3. Hi ${env.AUTHOR}, server running at Port: ${process.env.PORT}`
      )
    })
  } else {
    // Dùng server.listen thay vì app.listen vì lúc này server đã bao gồm express app và đã config socket.io
    server.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      console.log(
        `3. Hi ${env.AUTHOR}, server running at http://${env.LOCAL_DEV_APP_HOST}:${env.LOCAL_DEV_APP_PORT}/`
      )
    })
  }

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
