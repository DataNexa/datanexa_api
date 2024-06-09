
import JWT from "../libs/JWT";

import { type_session } from "../libs/session_manager";

const dataUser = {
    slug:"andreifcoelho.qs_midia",
    tipo_usuario:"USER_CLIENT",
    nonce:1,
    hash:"hash_test_user_control"
}
let expire = Date.now() + (1000 * 60 * 60)
const sess_test = JWT.generate(
    // type: session ou session_temp
    {alg:"sha256", type:type_session.SESSION, expire_in:expire},
    {
        user_type:dataUser.tipo_usuario,
        slug:dataUser.slug,
        nonce:dataUser.nonce,
        hash:dataUser.hash,
        expire_in: expire
    }
)