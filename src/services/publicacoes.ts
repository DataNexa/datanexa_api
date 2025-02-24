import { Request, Response } from 'express'
import response from '../util/response'
import publishRepo from '../repositories/publish.repo'
import { body, validationResult } from 'express-validator'
import { PublishClient } from '../types/Publish'


export default {


    read: async (req:Request, res:Response) => {

        const id = parseInt(req.params.id) || 0

        if(id == 0 || Number.isNaN(id)){
            return response(res, {code:400, message: 'O parâmetro id é requerido '})
        }

        const parsed = req.parsedQuery 
        parsed.filters['id'] = id 
        parsed.filters['client_id'] = req.parsedQuery.client_id 

        const publicacoes = await publishRepo.get(parsed)

        if(!publicacoes){
            return response(res, {
                code:500,
                message: 'Ocorreu um erro inesperado no servidor'
            })
        }

        if(publicacoes.length == 1){
            return response(res, {
                code:200,
                body:publicacoes[0]
            })
        }

        response(res, { code: 404, message: 'Publicação não encontrada'})

    },


    list: async (req:Request, res:Response) => {

        req.parsedQuery.filters['client_id'] = req.parsedQuery.client_id 

        const publicacoes = await publishRepo.get(req.parsedQuery)

        if(!publicacoes) {
            return response(res, { code: 400, message: 'Erro inesperado na requisição'})
        }

        response(res, { code: 200, body: publicacoes })

    },
    

    update: async (req:Request, res:Response) => {

        const client_id = req.parsedQuery.client_id 

        await body('id').isInt().run(req)
        await body('sentimento').isInt().run(req)
        await body('curtidas').isInt().run(req)
        await body('compartilhamento').isInt().run(req)
        await body('visualizacoes').isInt().run(req)
        await body('valoracao').isNumeric().run(req)

        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request - Campos Faltando"
            })
        }

        const { id, sentimento, curtidas, compartilhamento, visualizacoes, valoracao } = req.body

        const pub:PublishClient = {
            monitoramento_id:0,
            cliente_id:client_id,
            mensao_id:0,
            id:id,
            plataforma:1,
            link:'',
            texto:'',
            temImagem:false,
            temVideo:false,
            dataPublish:new Date(),
            sentimento:sentimento,
            valoracao:valoracao,
            engajamento:{
                curtidas:curtidas,
                compartilhamento:compartilhamento,
                visualizacoes:visualizacoes
            },
        }

        if(!await publishRepo.update(pub)){
            return response(res, {
                code: 500,
                message:"Server error - Erro ao tentar editar informações da Publicação"
            })
        }

        response(res)

    },


    create: async (req:Request, res:Response) => {

        const client_id = req.parsedQuery.client_id 

        await body('sentimento').isInt().run(req)
        await body('curtidas').isInt().run(req)
        await body('compartilhamento').isInt().run(req)
        await body('visualizacoes').isInt().run(req)
        await body('mensao_id').isInt().run(req)
        await body('monitoramento_id').isInt().run(req)
        await body('plataforma').isInt().run(req)
        await body('valoracao').isNumeric().run(req)

        await body('dataPublish').isString().run(req)

        await body('temImagem').isBoolean().run(req)
        await body('temVideo').isBoolean().run(req)
        
        await body('link').isString().trim().run(req)
        await body('texto').isString().trim().run(req)

        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request - Campos Faltando"
            })
        }

        const { monitoramento_id, mensao_id, plataforma, link, texto, temImagem, temVideo, dataPublish, sentimento, valoracao, curtidas, compartilhamento, visualizacoes } = req.body

        const pub:PublishClient = {
            monitoramento_id:monitoramento_id,
            cliente_id:client_id,
            mensao_id:mensao_id,
            id:0,
            plataforma:plataforma,
            link:link,
            texto:texto,
            temImagem:temImagem,
            temVideo:temVideo,
            dataPublish:new Date(dataPublish),
            sentimento:sentimento,
            valoracao:valoracao,
            engajamento:{
                curtidas:curtidas,
                compartilhamento:compartilhamento,
                visualizacoes:visualizacoes
            },
        }

        const pubFinal = await publishRepo.set(pub)

        if(!pubFinal){
            return response(res, {
                code: 500,
                message: 'Erro ao tentar salvar publicação'
            })
        }

        response(res, {
            code:200,
            body:pubFinal
        })

    },
    

    createMany: async (req: Request, res: Response) => {
        
        const client_id = req.parsedQuery.client_id;
    
        if (!Array.isArray(req.body)) {
            return response(res, {
                code: 400,
                message: "Bad Request - O corpo da requisição deve ser um array"
            });
        }
    
        await Promise.all(
            req.body.map(async (item, index) => {
                await body(`[${index}].sentimento`).isInt().run(req);
                await body(`[${index}].curtidas`).isInt().run(req);
                await body(`[${index}].compartilhamento`).isInt().run(req);
                await body(`[${index}].visualizacoes`).isInt().run(req);
                await body(`[${index}].mensao_id`).isInt().run(req);
                await body(`[${index}].monitoramento_id`).isInt().run(req);
                await body(`[${index}].plataforma`).isInt().run(req);
                await body(`[${index}].valoracao`).isNumeric().run(req);
                await body(`[${index}].dataPublish`).run(req);
                await body(`[${index}].temImagem`).isBoolean().run(req);
                await body(`[${index}].temVideo`).isBoolean().run(req);
                await body(`[${index}].link`).isString().trim().run(req);
                await body(`[${index}].texto`).isString().trim().run(req);
            })
        );
    
        if (!validationResult(req).isEmpty()) {
            return response(res, {
                code: 400,
                message: "Bad Request - Campos Faltando"
            });
        }
    
        const pubs: PublishClient[] = req.body.map(item => ({
            monitoramento_id: item.monitoramento_id,
            cliente_id: client_id,
            mensao_id: item.mensao_id,
            id: 0,
            plataforma: item.plataforma,
            link: item.link,
            texto: item.texto,
            temImagem: item.temImagem,
            temVideo: item.temVideo,
            dataPublish: new Date(item.dataPublish),
            sentimento: item.sentimento,
            valoracao: item.valoracao,
            engajamento: {
                curtidas: item.curtidas,
                compartilhamento: item.compartilhamento,
                visualizacoes: item.visualizacoes
            },
        }));
    
        const pubsFinal = await publishRepo.setMany(pubs);
    
        if (!pubsFinal) {
            return response(res, {
                code: 500,
                message: 'Erro ao tentar salvar publicações'
            });
        }
    
        response(res, {
            code: 200,
            body: pubsFinal
        });

    },

    delete: async (req:Request, res:Response) => {

        const client_id = req.parsedQuery.client_id;

        const id = parseInt(req.params.id) || 0

        if(id == 0 || Number.isNaN(id)){
            return response(res, {code:400, message: 'O parâmetro id é requerido '})
        }

        await publishRepo.del(client_id, id) ? 
            response(res) :
            response(res, {
                code:500,
                message:'Não foi possivel deletar o registro'
            })

    }
    

}