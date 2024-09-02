import { Request, Response, NextFunction } from 'express'
import response from '../util/response'
import { body, validationResult } from 'express-validator'
import { drawMonitoramentoReport } from '../libs/drawpdf/drawpdf'
import { monitoramento_repo, monitoramento_i } from '../repositories/monitoramento.repo'
import Data from '../util/data'


export default {

    listPriority: async (req:Request, res:Response) => {
        
        await body('client_id').isNumeric().run(req)

        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }

        const { client_id } = req.body

        const resp_repo = await monitoramento_repo.listPriority(client_id)

        if(!resp_repo){
            return response(res, {
                code:500,
                message: 'Erro no servidor'
            })
        }

        response(res, {
            code:200,
            body:resp_repo
        })

    },

    list: async (req:Request, res:Response) => {

        await body('client_id').isNumeric().run(req)

        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }
        
        const { client_id } = req.body
        const resp_repo = await monitoramento_repo.list(client_id)

        if(!resp_repo){
            return response(res, {
                code:500,
                message: 'Erro no servidor'
            })
        }

        response(res, {
            code:200,
            body:resp_repo
        })

    },

    read:  async (req:Request, res:Response) => {

        await body('client_id').isNumeric().run(req)
        await body('id').isNumeric().run(req)

        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }

        const { client_id, id } = req.body
        const resp_repo = await monitoramento_repo.read(client_id,id)

        if(resp_repo.error){
            return response(res, {
                code:resp_repo.code,
                message: resp_repo.message
            })
        }

        response(res, {
            code:200,
            body:resp_repo.row
        })

    },

    unique: async (req:Request, res:Response) => {

        await body('client_id').isNumeric().run(req)
        await body('id').isNumeric().run(req)
        await body('dataini').isString().run(req)
        await body('datafim').isString().run(req)

        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }
        
        const { client_id, id, dataini, datafim } = req.body
        const resp_repo = await monitoramento_repo.unique(client_id,id,dataini,datafim)

        if(resp_repo.error){
            return response(res, {
                code:resp_repo.code,
                message: resp_repo.message
            })
        }

        response(res, {
            code:200,
            body:resp_repo.row
        })

    },

    create: async (req:Request, res:Response) => {

        await body('client_id').isNumeric().run(req)
        await body('titulo').isString().trim().run(req)
        await body('objetivo').isString().trim().run(req)
        await body('pesquisa').isString().trim().run(req)
        await body('hashtags').isString().trim().run(req)
        await body('alvo').isString().trim().run(req)


        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }

        const { client_id,titulo,objetivo,pesquisa,alvo, hashtags } = req.body
        const creatat = new Date()
        const resp_repo = await monitoramento_repo.create(client_id,titulo,objetivo,creatat,pesquisa,alvo, hashtags)

        if(resp_repo.error){
            return response(res, {
                code:resp_repo.code,
                message: resp_repo.message
            })
        }

        response(res, {
            code:200,
            body:resp_repo.insertId
        })

    },

    update: async (req:Request, res:Response) => {

        await body('client_id').isNumeric().run(req)
        await body('titulo').isString().trim().run(req)
        await body('descricao').isString().trim().run(req)
        await body('pesquisa').isString().trim().run(req)
        await body('alvo').isString().trim().run(req)
        await body('hashtags').isString().trim().run(req)
        await body('id').isNumeric().run(req)

        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }
        
        const { client_id,titulo,descricao,pesquisa,alvo,id, hashtags } = req.body
        const resp_repo = await monitoramento_repo.update(client_id,titulo,descricao,pesquisa,alvo,id,hashtags)

        if(!resp_repo){
            return response(res, {
                code:500,
                message: 'Erro no servidor ao tentar alterar registro'
            })
        }
        
        response(res)

    },    
    
    delete: async (req:Request, res:Response) => {

        await body('client_id').isNumeric().run(req)
        await body('id').isNumeric().run(req)


        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }
        
        const { client_id,id } = req.body
        const resp_repo = await monitoramento_repo.delete(client_id,id)

        if(!resp_repo){
            return response(res, {
                code:500,
                message: 'Erro no servidor ao tentar excluir registro'
            })
        }

        response(res)

    },

    ativar: async (req:Request, res:Response) => {

        await body('client_id').isNumeric().run(req)
        await body('status').isBoolean().run(req)
        await body('id').isNumeric().run(req)

        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }

        const { client_id, status, id } = req.body

        const resp = await monitoramento_repo.alterarStatus(client_id, id, status)

        if(!resp) {
            return response(res, {
                code: 500,
                message: "Erro ao tentar alterar status do monitoramento"
            })
        }

        response(res)

    },

    repetir: async (req:Request, res:Response) => {

        await body('client_id').isNumeric().run(req)
        await body('status').isBoolean().run(req)
        await body('id').isNumeric().run(req)

        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }

        const { client_id, status, id } = req.body

        const resp = await monitoramento_repo.alterarRepeticao(client_id, id, status)

        if(!resp) {
            return response(res, {
                code: 500,
                message: "Erro ao tentar alterar repetição do monitoramento"
            })
        }

        response(res)

    },

    gerarRelatorio: async (req:Request, res:Response) => {
        
        await body('client_id').isNumeric().run(req)
        await body('id').isNumeric().run(req)

        await body('dataini').isString().run(req)
        await body('datafim').isString().run(req)

        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }

        const { client_id, id, dataini, datafim } = req.body
        const resp_repo = await monitoramento_repo.unique(client_id, id, dataini, datafim)

        if(resp_repo.error){
            return response(res, {
                code:resp_repo.code,
                message: resp_repo.message
            })
        }

        try {

            const monitoramento = resp_repo.row as monitoramento_i

            const pdfBytes = await drawMonitoramentoReport({
                hashtags:monitoramento.hashtags ? monitoramento.hashtags.join(" ") : "",
                pesquisa:monitoramento.pesquisa,
                titulo: monitoramento.titulo,
                descricao: monitoramento.descricao,
                data_ini: new Data(dataini).toBr(),
                data_fim: new Data(datafim).toBr(),
            }, monitoramento.stats ? monitoramento.stats : []);
            
            if(pdfBytes){
                res.setHeader('Content-Disposition', 'attachment; filename='+monitoramento.titulo+'.pdf');
                res.setHeader('Content-Type', 'application/pdf');
                res.send(Buffer.from(pdfBytes));
            } else {
                return response(res, {
                    code:400,
                    message:'Bad Request'
                })
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            res.status(500).send('Internal Server Error');
        }

    }

}