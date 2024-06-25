
import { query, execute, multiTransaction } from "../util/query"

// opções de resposta para a pergunta genérica
interface options_pergunta_pesquisa {
    pergunta_pesquisa_id:number,
    valor:string
}

// opções de resposta sobre o perfil do usuário
interface options_pergunta_perfil {
    pergunta_perfil_id:number,
    valor:string
}

// pergunta sobre o perfil do usuário
// genero
// idade tipo range -> 16-20 anos | 21-25 anos, etc
// e outros tipos de perguntas convenientes
interface perguntas_perfil {
    pesquisa_id:number,
    valor:string,// valor da pergunta em si
    options:options_pergunta_perfil[]
}

// perguntas genericas sobre o tema da pesquisa
interface perguntas_pesquisa {
    pesquisa_id:number,
    valor:string, // valor da pergunta em si
    options:options_pergunta_pesquisa[]
}

// pesquisa
interface pesquisa {
    titulo:string,
    descricao:string,
    ativo:number,
    criadoEm:string, // aaaa-mm-dd h:m:s
    terminaEm:string, // aaaa-mm-dd h:m:s
    perguntas:perguntas_pesquisa[],
    perguntas_perfil:perguntas_perfil[]

}

const pesquisas:pesquisa[] = [
    {
        "titulo": "Pesquisa de Satisfação do Cliente",
        "descricao": "Avaliação da satisfação dos clientes com os serviços prestados.",
        "ativo": 1,
        "criadoEm": "2024-06-19 10:00:00",
        "terminaEm": "2024-07-19 10:00:00",
        "perguntas": [
            {
                "pesquisa_id": 1,
                "valor": "Como você avalia o nosso serviço?",
                "options": [
                    {
                        "pergunta_pesquisa_id": 1,
                        "valor": "Muito satisfeito"
                    },
                    {
                        "pergunta_pesquisa_id": 2,
                        "valor": "Satisfeito"
                    },
                    {
                        "pergunta_pesquisa_id": 3,
                        "valor": "Indiferente"
                    },
                    {
                        "pergunta_pesquisa_id": 4,
                        "valor": "Insatisfeito"
                    },
                    {
                        "pergunta_pesquisa_id": 5,
                        "valor": "Muito insatisfeito"
                    }
                ]
            },
            {
                "pesquisa_id": 1,
                "valor": "Você recomendaria nosso serviço a outras pessoas?",
                "options": [
                    {
                        "pergunta_pesquisa_id": 6,
                        "valor": "Sim"
                    },
                    {
                        "pergunta_pesquisa_id": 7,
                        "valor": "Não"
                    }
                ]
            }
        ],
        "perguntas_perfil": [
            {
                "pesquisa_id": 1,
                "valor": "Qual é o seu gênero?",
                "options": [
                    {
                        "pergunta_perfil_id": 1,
                        "valor": "Masculino"
                    },
                    {
                        "pergunta_perfil_id": 2,
                        "valor": "Feminino"
                    },
                    {
                        "pergunta_perfil_id": 3,
                        "valor": "Outro"
                    }
                ]
            },
            {
                "pesquisa_id": 1,
                "valor": "Qual é a sua faixa etária?",
                "options": [
                    {
                        "pergunta_perfil_id": 4,
                        "valor": "16-20 anos"
                    },
                    {
                        "pergunta_perfil_id": 5,
                        "valor": "21-25 anos"
                    },
                    {
                        "pergunta_perfil_id": 6,
                        "valor": "26-30 anos"
                    },
                    {
                        "pergunta_perfil_id": 7,
                        "valor": "31-35 anos"
                    },
                    {
                        "pergunta_perfil_id": 8,
                        "valor": "36-40 anos"
                    },
                    {
                        "pergunta_perfil_id": 9,
                        "valor": "41-45 anos"
                    },
                    {
                        "pergunta_perfil_id": 10,
                        "valor": "46-50 anos"
                    },
                    {
                        "pergunta_perfil_id": 11,
                        "valor": "51+ anos"
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Pesquisa de Preferências de Produtos",
        "descricao": "Identificação das preferências dos consumidores em relação aos produtos oferecidos.",
        "ativo": 1,
        "criadoEm": "2024-06-20 11:00:00",
        "terminaEm": "2024-07-20 11:00:00",
        "perguntas": [
            {
                "pesquisa_id": 2,
                "valor": "Quão satisfeito você está com nossos produtos?",
                "options": [
                    {
                        "pergunta_pesquisa_id": 8,
                        "valor": "Muito satisfeito"
                    },
                    {
                        "pergunta_pesquisa_id": 9,
                        "valor": "Satisfeito"
                    },
                    {
                        "pergunta_pesquisa_id": 10,
                        "valor": "Indiferente"
                    },
                    {
                        "pergunta_pesquisa_id": 11,
                        "valor": "Insatisfeito"
                    },
                    {
                        "pergunta_pesquisa_id": 12,
                        "valor": "Muito insatisfeito"
                    }
                ]
            },
            {
                "pesquisa_id": 2,
                "valor": "Você recomendaria nossos produtos a outras pessoas?",
                "options": [
                    {
                        "pergunta_pesquisa_id": 13,
                        "valor": "Sim"
                    },
                    {
                        "pergunta_pesquisa_id": 14,
                        "valor": "Não"
                    }
                ]
            },
            {
                "pesquisa_id": 2,
                "valor": "Qual produto você prefere?",
                "options": [
                    {
                        "pergunta_pesquisa_id": 15,
                        "valor": "Produto A"
                    },
                    {
                        "pergunta_pesquisa_id": 16,
                        "valor": "Produto B"
                    },
                    {
                        "pergunta_pesquisa_id": 17,
                        "valor": "Produto C"
                    }
                ]
            }
        ],
        "perguntas_perfil": [
            {
                "pesquisa_id": 2,
                "valor": "Qual é o seu gênero?",
                "options": [
                    {
                        "pergunta_perfil_id": 4,
                        "valor": "Masculino"
                    },
                    {
                        "pergunta_perfil_id": 5,
                        "valor": "Feminino"
                    },
                    {
                        "pergunta_perfil_id": 6,
                        "valor": "Outro"
                    }
                ]
            },
            {
                "pesquisa_id": 2,
                "valor": "Qual é a sua faixa etária?",
                "options": [
                    {
                        "pergunta_perfil_id": 7,
                        "valor": "16-20 anos"
                    },
                    {
                        "pergunta_perfil_id": 8,
                        "valor": "21-25 anos"
                    },
                    {
                        "pergunta_perfil_id": 9,
                        "valor": "26-30 anos"
                    },
                    {
                        "pergunta_perfil_id": 10,
                        "valor": "31-35 anos"
                    },
                    {
                        "pergunta_perfil_id": 11,
                        "valor": "36-40 anos"
                    },
                    {
                        "pergunta_perfil_id": 12,
                        "valor": "41-45 anos"
                    },
                    {
                        "pergunta_perfil_id": 13,
                        "valor": "46-50 anos"
                    },
                    {
                        "pergunta_perfil_id": 14,
                        "valor": "51+ anos"
                    }
                ]
            }
        ]
    }
]


interface perguntas_simpl {
    perguntas:{[key:number]:number[]},
    perguntas_perfil_ids:{[key:number]:number[]}
}

interface pesquisa_simpl {[key:number]:perguntas_simpl}

const insertDummyResponses = async () => {

    const conn = await multiTransaction()

    const respostas_totais_por_pesquisa = 100

    const getPerfilOptions = await conn.query(
        `select 
            pesquisas.id as pesquisa_id,
            opcoes_pergunta_perfil_pesquisa.id as option_perfil_id, 
            opcoes_pergunta_perfil_pesquisa.pergunta_perfil_pesquisa_id as pergunta_perfil_id

        from opcoes_pergunta_perfil_pesquisa 
        join perguntas_perfil_pesquisa on opcoes_pergunta_perfil_pesquisa.pergunta_perfil_pesquisa_id = perguntas_perfil_pesquisa.id
        join pesquisas on pesquisas.id = perguntas_perfil_pesquisa.pesquisa_id
        join client on pesquisas.client_id = client.id

        where
            client.id = 1
    `)

    const getPerguntasOptions = await conn.query(
        `select 
            pesquisas.id as pesquisa_id,
            opcoes_pergunta_pesquisa.id as option_id, 
            opcoes_pergunta_pesquisa.pergunta_pesquisa_id as pergunta_id

        from opcoes_pergunta_pesquisa 
        join perguntas_pesquisa on opcoes_pergunta_pesquisa.pergunta_pesquisa_id = perguntas_pesquisa.id
        join pesquisas on pesquisas.id = perguntas_pesquisa.pesquisa_id
        join client on pesquisas.client_id = client.id

        where
            client.id = 1
    `)

    const pesquisas:pesquisa_simpl = {}
    
    for(const row of getPerfilOptions.rows as any[]){

        if (!pesquisas[row.pesquisa_id]) {
            pesquisas[row.pesquisa_id] = { perguntas:{}, perguntas_perfil_ids:{} };
        }
    
        if (!pesquisas[row.pesquisa_id].perguntas_perfil_ids[row.pergunta_perfil_id]) {
            pesquisas[row.pesquisa_id].perguntas_perfil_ids[row.pergunta_perfil_id] = [];
        }
    
        pesquisas[row.pesquisa_id].perguntas_perfil_ids[row.pergunta_perfil_id].push(row.option_perfil_id);
        
    }
    
    for(const row of getPerguntasOptions.rows as any[]){

        if (!pesquisas[row.pesquisa_id]) {
            pesquisas[row.pesquisa_id] = { perguntas:{}, perguntas_perfil_ids:{} };
        }
    
        if (!pesquisas[row.pesquisa_id].perguntas[row.pergunta_id]) {
            pesquisas[row.pesquisa_id].perguntas[row.pergunta_id] = [];
        }
    
        pesquisas[row.pesquisa_id].perguntas[row.pergunta_id].push(row.option_id);
        
    }

    const totalpesquisas = Object.keys(pesquisas).length

    for (let i = 0; i < respostas_totais_por_pesquisa; i++) {
        
        const nome      = `dummy_name_${i}`
        const sobrenome = `dummy_lastname_${i}`

        for(const pesquisa_id of Object.keys(pesquisas)){
            
            const pesquisa = pesquisas[parseInt(pesquisa_id)]
    
            const insertResposta = await conn.execute('insert into respostas_pesquisa (pesquisa_id, nome, sobrenome) values (?,?,?)', {
                binds:[pesquisa_id, nome, sobrenome]
            })

            if(insertResposta.error){
                conn.rollBack()
                console.log('erro 1:', insertResposta.error_code);
                return   
            }

            const resposta_id = (insertResposta.rows as any).insertId

            for(const pergunta_id of Object.keys(pesquisa.perguntas)){

                let insertRespostaPesquisaPerguntas = " insert into respostas_pergunta (resposta_id, opcao_pergunta_id) values "

                const options = pesquisa.perguntas[parseInt(pergunta_id)]
                const total_o = options.length
                const randomI = Math.floor(Math.random() * total_o);
                const opcao_i = options[randomI]

                insertRespostaPesquisaPerguntas += `(${resposta_id}, ${opcao_i}),`

                insertRespostaPesquisaPerguntas = insertRespostaPesquisaPerguntas.substring(0, insertRespostaPesquisaPerguntas.length - 1)
                const inserOptionsPerfil = await conn.execute(insertRespostaPesquisaPerguntas)

                if(inserOptionsPerfil.error){
                    conn.rollBack()
                    console.log('erro 2:', inserOptionsPerfil.error_code);
                    return   
                }

            }

        
            for(const pergunta_id of Object.keys(pesquisa.perguntas_perfil_ids)){

                let insertRespostaPesquisaPerfil = " insert into respostas_perfil_pesquisa (resposta_id, opcao_pergunta_perfil_id) values "

                const options = pesquisa.perguntas_perfil_ids[parseInt(pergunta_id)]
                const total_o = options.length
                const randomI = Math.floor(Math.random() * total_o);
                const opcao_i = options[randomI]

                insertRespostaPesquisaPerfil += `(${resposta_id}, ${opcao_i}),`
                insertRespostaPesquisaPerfil = insertRespostaPesquisaPerfil.substring(0, insertRespostaPesquisaPerfil.length - 1)
                const inserOptionsPergunta = await conn.execute(insertRespostaPesquisaPerfil)

                if(inserOptionsPergunta.error){
                    conn.rollBack()
                    console.log('erro 3:', inserOptionsPergunta.error_code);
                    return   
                }

            }

        }

    }

    await conn.finish()

    console.log(
        `FAKE RESPOSTAS DAS PESQUISAS FORAM INSERIDAS:
            total de pesquisas: ${totalpesquisas}
            repostas em cada pesquisa ${respostas_totais_por_pesquisa}
    `);
    
}


const insertPesquisas = async () => {

    const conn = await multiTransaction()

    const resp = await conn.query('select * from pesquisas where client_id = 1')
    
    if((resp.rows as any[]).length > 0) {
        console.log("Já existem registros em pesquisas");  
        return
    } 

    for(const pesquisa of pesquisas){
        
        const insertPesquisa = await conn.execute('insert into pesquisas (titulo, descricao, ativo, client_id, createAt, duration) values (?,?,?,?,?,?)', {
            binds:[pesquisa.titulo, pesquisa.descricao, 1, 1, pesquisa.criadoEm, pesquisa.terminaEm ]
        })

        if(insertPesquisa.error){
            await conn.rollBack()
            console.log("erro 1 :", insertPesquisa.error_code);
            return
        }

        const pesquisa_id = (insertPesquisa.rows as any).insertId

        for(const pergunta of pesquisa.perguntas){

            const insertPerguntas = await conn.execute('insert into perguntas_pesquisa (pesquisa_id, pergunta) values (?,?)', {
                binds:[pesquisa_id, pergunta.valor]
            })

            if(insertPerguntas.error){
                await conn.rollBack()
                console.log("erro 2 :", insertPerguntas.error_code);
                return
            }
    
            const pergunta_id = (insertPerguntas.rows as any).insertId

            for(const option of pergunta.options){

                const insertOptions = await conn.execute('insert into opcoes_pergunta_pesquisa(pergunta_pesquisa_id, valor) values (?,?)', {
                    binds:[pergunta_id, option.valor]
                })

                if(insertOptions.error){
                    await conn.rollBack()
                    console.log("erro 3 :", insertPerguntas.error_code);
                    return
                }

            }

        }

        for(const pergunta of pesquisa.perguntas_perfil){

            const insertPerguntas = await conn.execute('insert into perguntas_perfil_pesquisa (pesquisa_id, pergunta) values (?,?)', {
                binds:[pesquisa_id, pergunta.valor]
            })

            if(insertPerguntas.error){
                await conn.rollBack()
                // console.log(insertPerguntas.error_code);
                return 
            }
    
            const pergunta_id = (insertPerguntas.rows as any).insertId

            for(const option of pergunta.options){

                const insertOptions = await conn.execute('insert into opcoes_pergunta_perfil_pesquisa(pergunta_perfil_pesquisa_id, valor) values (?,?)', {
                    binds:[pergunta_id, option.valor]
                })

                if(insertOptions.error){
                    await conn.rollBack()
                    console.log("erro 4 :", insertPerguntas.error_code);
                    return
                }

            }

        }

    }

    await conn.finish()

    console.log("VALORES INSERIDOS COM SUCESSO!");
    

}

export { insertPesquisas, insertDummyResponses }