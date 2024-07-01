
import insert from "./insert_monitoramento_fake"


const init = async () => {
    
    await insert()    

    console.log("finalizou");
    
}

init()
