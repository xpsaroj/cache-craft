export default () => ({
    jwt: {
        secret: process.env.JWT_SECRET,
        accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN ?? '15m',
    },
});