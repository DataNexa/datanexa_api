import { OAuth2Client } from 'google-auth-library';

const googleClientId = '469439274694-s5qt48a1ja76ilta8kc9echtapn3uel7.apps.googleusercontent.com';

const client = new OAuth2Client(googleClientId);

const tokenValidation = async (token: string) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: googleClientId,
        });

        const payload = ticket.getPayload();

        return payload || false;

    } catch (error) {
        return false;
    }
};

export { tokenValidation };