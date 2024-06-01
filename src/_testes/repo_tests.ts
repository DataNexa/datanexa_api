import { account_repo, JOIN } from "../repositories/account.repo"
export default async () => {
    let acc = await account_repo.getAccount({
        email:'andreifcoelho@gmail.com'
    },{
        join:[JOIN.RECOVER],
        order:" order by recover.id desc limit 1"
    })

    console.log(acc);
    
}