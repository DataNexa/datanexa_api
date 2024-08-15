import { Router } from "express";
import { authorization_route } from '../util/autorization'

import client_service from '../services/client.service'

const router = Router()

export default () => {

    router.post('/create', authorization_route('onlyAdmin'), client_service.create)
    router.post('/list', authorization_route('onlyAdmin'), client_service.list)
    router.post('/update', authorization_route('onlyAdmin'), client_service.update)

    return router
}