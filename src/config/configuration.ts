export default () => ({
    port: parseInt(process.env.PORT, 10) || 3000,
    host: process.env.HOST,
   dracoon: {
       url: process.env.DRACOON_BASE_URL,
       clientId: process.env.DRACOON_CLIENT_ID,
       clientSecret: process.env.DRACOON_CLIENT_SECRET,
       roomService: { 
        roomAdminUsername: process.env.ROOM_ADMIN_USERNAME,
        roomAdminPassword: process.env.ROOM_ADMIN_PASSWORD,
        roomAdminId: process.env.DRACOON_ROOM_ADMIN_ID,
        parentRoomId: process.env.DRACOON_PARENT_ROOM_ID,
       }
   },
   rabbit: {
    url: process.env.RABBIT_MQ_HOST
  },
  });