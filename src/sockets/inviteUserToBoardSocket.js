export const inviteUserToBoardSocket = (socket) => {
  socket.on('FE_INVITED_USER_TO_BOARD', (invitation) => {
    // emit ngược lại một sự kiện về cho mọi client khác (ngoại trừ chính cái thằng gửi request lên), rồi phía FE check
    socket.broadcast.emit('BE_INVITED_USER_TO_BOARD', invitation)
  })
}
