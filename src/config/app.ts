module.exports = {
  port: 3333,
  mongoUri: 'mongodb+srv://root:root@beautysalon.hsvsc.mongodb.net/beauty_salon?retryWrites=true&w=majority',
  jwt: {
    secret: '5e7a2eb53b92a881e87b3a1b',
    tokens: {
      access: {
        type: 'access',
        expiresIn: '30m',
      },
      refresh: {
        type: 'refresh',
        expiresIn: '50m',
      },
    },
  },
};
