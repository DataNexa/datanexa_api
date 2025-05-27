import userRepo from "../repositories/user.repo";
import Config from "../util/config";
import Logger from "../util/logger";

const install = async () => {

    const config = Config.instance()

    if(config.getConf().configurado){
        Logger.info('Sistema já configurado')
        return 
    }

    const master = config.getData().master
    const email = master.email || 'admin@datanexa.com.br'

    const user =  await userRepo.saveUserAdmin('AdminDefault', email, 'no-image', master.senha || 'admin@123')

    if(!user){
        Logger.error('Erro ao criar o usuário admin', 'install')
        throw new Error('Erro ao criar o usuário admin')
    }

    const token = await userRepo.saveDeviceAndGenerateTokenRefresh(user.id, email, 'Ubuntu Server', 'localhost:8080')
    
    if(!token){
        Logger.error('Erro ao criar o refresh token', 'install')
        throw new Error('Erro ao criar o refresh token')
    }

    const pipeline_user = config.getPipelineUser()

    const user_pipeline = await userRepo.saveUserBot(pipeline_user)

    if(!user_pipeline){
        Logger.error('Erro ao criar o usuário pipeline', 'install')
        throw new Error('Erro ao criar o usuário pipeline')
    }

    const token_pipeline = await userRepo.saveDeviceAndGenerateTokenRefresh(user_pipeline.id, '', 'Airflow', 'localhost:8080')
    
    if(!token_pipeline){
        Logger.error('Erro ao criar o refresh token do pipeline', 'install')
        throw new Error('Erro ao criar o refresh token do pipeline')
    }

    config.setConfigured()

}

const reset_all = () => {
    // refaz o admin com configurações default
}

const create_user_and_client_test = () => {

}

const create_procedures = () => {
    
}

const create_tables = () => {

}

const create_admin = () => {

}


export default { install, reset_all }