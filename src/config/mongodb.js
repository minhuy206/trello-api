import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from '~/config/environment'

// Khởi tạo đối tượng trelloDatabaseInstance ban đầu là null (vì chưa connect)
let trelloDatabaseInstance = null

// Khởi tạo đối tượng client để connect tới MongoDB
const client = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

// Hàm connect tới MongoDB
export const CONNECT_DB = async () => {
  // Gọi kết nối tới MongoDB Atlat với URI đã khai báo trong thân của client
  await client.connect()

  // Kết nối thành công thì lấy ra database theo tên và gán ngược nó lại vào biến trelloDatabaseInstance
  trelloDatabaseInstance = client.db(env.DATABASE_NAME)
}

export const GET_DB = () => {
  if (!trelloDatabaseInstance)
    throw new Error('Must connect to database first!')

  return trelloDatabaseInstance
}

export const CLOSE_DB = async () => {
  await client.close()
}
