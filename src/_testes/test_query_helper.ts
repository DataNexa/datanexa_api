import query from "../helpers/query";
import { generateSession,verifySession, type_session, generateToken } from "../model/session_manager";

export default async () => {
    const session = generateToken(
        {
            token_account_hash:"iudhfiudhf",
            token_account_device:"iudhiuhfdf"
        }
    )

    const test_user1 = verifySession(session)
    
    console.log(session);
    console.log(test_user1);

    const nsession = test_user1 && test_user1.account ? generateToken(test_user1.account) : "err"

    const test_user2 = verifySession(nsession)

    console.log(nsession);
    console.log(test_user2);

    return await query("SELECT * FROM cidades where adicionado = ?", [2022])
}