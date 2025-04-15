
const googleClientId = '469439274694-s5qt48a1ja76ilta8kc9echtapn3uel7.apps.googleusercontent.com';

const tokenValidation = async (token:string) => {

    const { jwtVerify, createRemoteJWKSet } = await import('jose');

    const JWKS = await createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
    
    try {
        const { payload } = await jwtVerify(token, JWKS, {
            issuer:'https://accounts.google.com',
            audience:googleClientId
        })

        return payload

    } catch (error) {
        return false
    }

}


export { tokenValidation }