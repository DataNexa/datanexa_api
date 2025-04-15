export const jwtVerify = jest.fn().mockResolvedValue({
    payload: { sub: 'mock-user-id' },
});
export const createRemoteJWKSet = jest.fn();