//minhuy
// AlEJIzVWryD83mpd

const MONGODB_URI =
  'mongodb+srv://minhuy:AlEJIzVWryD83mpd@cluster0.t1tvw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

const DATABASE_NAME = 'trello'

import { MongoClient, ServerApiVersion } from 'mongodb'

// Khởi tạo đối tượng trelloDatabaseInstance ban đầu là null (vì chưa connect)
let trelloDatabaseInstance = null

// Khởi tạo đối tượng client để connect tới MongoDB
const client = new MongoClient(MONGODB_URI, {
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
  trelloDatabaseInstance = client.db(DATABASE_NAME)
}

export const GET_DB = () => {
  if (!trelloDatabaseInstance)
    throw new Error('Must connect to database first!')

  return trelloDatabaseInstance
}
