
import { createDonut, colors, createPesquisaHorizontalBar } from "../libs/SVGDrawn";
import { createPDF, typeCols, Content } from "../libs/pdfmaker";

const background_color_pattern = "#e6ecf0"
const logo = `
    <svg xmlns="http://www.w3.org/2000/svg" 
    width="83.33px" height="50px" 
    viewBox="0 0 83.33 50"
    xmlns:xlink="http://www.w3.org/1999/xlink">
        <g id="Camada_x0020_1" >
            <rect width="100%" height="100%" fill="#0080FF" />
            <path transform="scale(0.33333)" fill="white" d="M208.35 77.68c6.41,0 9.16,0.95 14.36,4.03 1.5,0.82 2.91,1.77 4.23,2.83 -0.68,-1.5 -2.01,-3.35 -3.59,-4.11l1.21 -2.42 12.05 0 0 20.63 0 17.91 0 20.1 -12.91 0 -0.35 -1.77c1.68,-1.01 2.74,-1.78 3.29,-4.01 -1.04,0.82 -2.14,1.57 -3.29,2.24 -5.16,2.74 -8.56,3.78 -15,3.87 -16.38,0.23 -29.65,-13.27 -29.65,-29.65 0,-16.37 13.27,-29.65 29.65,-29.65zm-168.27 -0.87c14.68,0 26.68,12.01 26.68,26.69l0 32.61 -16.47 0 0 -30.78c0,-5.62 -4.59,-10.22 -10.21,-10.22 -5.62,0 -10.21,4.6 -10.21,10.22l0 30.78 -16.48 0 0 -32.61 0 -26.25 10.5 0 1.1 2.43c-2.49,1.63 -4.59,3.78 -4.59,5.83l0 0c4.89,-5.34 11.91,-8.7 19.68,-8.7zm142.62 59.8l-15.75 0.16 -11.77 -15.8 -0.16 -6.43 -17.77 22.04 -20.65 0.11 26.89 -32.33 -22.21 -26.65 15.15 0.01 18.61 23.59 -1.92 -8.38 11.9 -15.21 20.59 -0.03 -25.38 31.26 22.47 27.66zm-83.17 -59.8c10.78,0 20.24,5.7 25.52,14.25l-0.3 0.3 -11.77 11.78 -14.64 14.64 -6.82 0.08c1.77,1.44 3.08,2.08 4.36,2.37l0 0.01c0.48,0.14 0.97,0.24 1.48,0.32 0.7,0.11 1.42,0.17 2.17,0.17 3.16,0 6.07,-1.06 8.41,-2.83l4.76 4.84 6.53 6.63c-5.26,4.61 -12.16,7.4 -19.7,7.4 -16.57,0 -29.99,-13.42 -29.99,-29.98 0,-16.56 13.42,-29.98 29.99,-29.98zm10.39 18c-4.31,-1.6 -8.06,-2.53 -12.69,-1.77 -6.6,1.1 -11.64,6.83 -11.64,13.75 0,1.68 0.3,3.35 0.89,4.93l16.4 -16.1 7.04 -0.81zm84.59 12.52c0,7.64 6.2,13.84 13.84,13.84 7.92,0 15.22,-6.76 15.22,-14.83 0,-7.82 -6.34,-14.16 -14.16,-14.16 -7.97,0 -14.9,7.23 -14.9,15.15z"/>
            <path transform="scale(0.33333)" fill="#C2D9FF" d="M208.35 13.01c6.41,0 9.16,0.95 14.36,4.03 1.5,0.82 2.91,1.78 4.23,2.84 -0.68,-1.5 -2.01,-3.35 -3.59,-4.12l1.21 -2.42 12.05 0 0 20.63 0 17.91 0 20.1 -12.91 0 -0.35 -1.76c1.68,-1.02 2.74,-1.79 3.29,-4.01 -1.04,0.81 -2.14,1.56 -3.29,2.24 -5.16,2.73 -8.56,3.77 -15,3.86 -16.37,0.23 -29.65,-13.27 -29.65,-29.65 0,-16.37 13.27,-29.65 29.65,-29.65zm-100.56 0c6.41,0 9.16,0.95 14.37,4.03 1.49,0.82 2.9,1.78 4.22,2.84 -0.68,-1.5 -2.01,-3.35 -3.58,-4.12l1.21 -2.42 12.04 0 0 20.63 0 17.91 0 20.1 -12.91 0 -0.35 -1.76c1.68,-1.02 2.74,-1.79 3.29,-4.01 -1.04,0.81 -2.14,1.56 -3.29,2.24 -5.16,2.73 -8.56,3.77 -15,3.86 -16.37,0.23 -29.65,-13.27 -29.65,-29.65 0,-16.37 13.27,-29.65 29.65,-29.65zm-13.84 29.65c0,7.64 6.2,13.84 13.84,13.84 7.92,0 15.23,-6.76 15.23,-14.83 0,-7.82 -6.35,-14.16 -14.17,-14.16 -7.96,0 -14.9,7.24 -14.9,15.15zm54.18 -29.34l18.45 0 0 5.93 0 1.75 1.5 -0.01 13.02 -0.08 -6.68 11.61 -6.11 -0.03 -1.73 -3.55 0 5.22 0 1.42 0 36.38 -18.45 0 0 -37.1 0 -1.19 0 -4.48 -1.73 3.2 -4.2 -0.02 0 -11.21 5.92 -0.04 0.01 -1.87 0 -5.93zm-74.45 29.49c0,-16.22 -12.01,-29.49 -26.69,-29.49 -11.2,0 -22.4,0 -33.6,0l0 59.01 0.99 -0.04 32.61 0c14.68,0 26.69,-13.27 26.69,-29.48zm-41.97 -16.35l2.56 5.06 10.89 0c5.62,0 10.22,5.08 10.22,11.29 0,6.2 -4.6,11.26 -10.22,11.28l-10.69 0.06 -3.09 4.19 0.11 -6.81 0.22 -25.07zm162.8 16.2c0,7.64 6.2,13.84 13.84,13.84 7.92,0 15.22,-6.76 15.22,-14.83 0,-7.82 -6.34,-14.16 -14.16,-14.16 -7.97,0 -14.9,7.24 -14.9,15.15z"/>
        </g>
    </svg>
`

function criarSlug(frase: string): string {
    let slug = frase.trim().toLowerCase();
    slug = slug.replace(/[^\w\s-]/g, ''); 
    slug = slug.replace(/[\s]+/g, '-');
    return slug;
}

interface pesquisa_info_i {
    titulo:string,
    quantidadePesquisados:number,
    dataRelatorio:string,
    dataInicio:string,
    dataFim:string,
    geradoPor:string
}

interface options_i {
    valor:string,
    porcentagem:number
}

interface questionario_data_i {
    pergunta:string,
    options:options_i[]
}

const header_pesquisa = (pesquisa:pesquisa_info_i):Content[] => {
    return [
        {
            background:background_color_pattern,
            cols:{
                type:typeCols.HORIZONTAL,
                content:[
                    {
                        svg:logo,
                        height:100,
                        margin:{
                            top: -30,
                            left: 20
                        }
                    },
                    {
                        cols:{
                            type:typeCols.VERTICAL,
                            content:[
                                {
                                    text:{
                                        value:"Relatorio de Pesquisa",
                                        size:20,
                                        color:"#0080FF",
                                        font:"HelveticaBold",
                                        margin:{
                                            top:20
                                        }
                                    },
                                    height:20,
                                },
                                {
                                    text:{
                                        value:"Gerado por: "+pesquisa.geradoPor,
                                        size:12,
                                        margin:{
                                            top:50
                                        }
                                    },
                                    height:20,
                                }
                            ]
                        },
                        height: 100
                    },
                 
                ]
            },
            height:100
        },
        {
            text:{
                size:18,
                font:"HelveticaBold",
                value:pesquisa.titulo,
                color:"#0080FF",
                margin:{
                    left:20,
                    top:10
                }
            },
            height: 40
       },

       // info inicio
       {
            cols:{
                type:typeCols.HORIZONTAL,
                content:[
                    // lado esquerdo
                    {
                        cols:{
                            type:typeCols.VERTICAL,
                            content:[
                                {
                                    text:{
                                        size:14,
                                        font:'HelveticaBold',
                                        value:'Quantidade de Entrevistados: '+pesquisa.quantidadePesquisados,
                                        margin:{
                                            left: 20
                                        }
                                    },
                                    height:50
                                },
                                {
                                    text:{
                                        size:14,
                                        font:'HelveticaBold',
                                        value:'Data do Relatorio: '+pesquisa.dataRelatorio,
                                        margin:{
                                            top: 30,
                                            left: 20
                                        }
                                    },
                                    height:50
                                }
                            ]
                        },
                        height:50
                    },
                     // lado direito
                    {
                        cols:{
                            type:typeCols.VERTICAL,
                            content:[
                                {
                                    text:{
                                        size:14,
                                        font:'HelveticaBold',
                                        value:'Data de Inicio: '+pesquisa.dataInicio,
                                        margin:{
                                            left: 20
                                        }
                                    },
                                    height:50
                                },
                                {
                                    text:{
                                        size:14,
                                        font:'HelveticaBold',
                                        value:'Data de Término: '+pesquisa.dataFim,
                                        margin:{
                                            top: 30,
                                            left: 20
                                        }
                                    },
                                    height:50
                                }
                            ]
                        },
                        height:50
                    }
                ]
            },
            height:80,
       }
    ]
}

interface data_perfil_i {
    [key:string]:number
}

interface perfil_i {
    nome:string,
    data:data_perfil_i
}

const template_legenda_pesquisa = (perfil:perfil_i):Content => {

    const values = Object.values(perfil.data)
    const keys   = Object.keys(perfil.data)
    const kcores = Object.keys(colors)
    const contents:Content[] = [
        {
            text:{
                value:perfil.nome,
                size:14,
                font:"HelveticaBold",
                margin:{
                    left:80
                }
            },
            height:30
        },
        // svg
        {
            svg:createDonut(criarSlug(perfil.nome), 100, values),
            height:100,
            margin:{
                left:60,
                top:40
            }
        }
    ]
    let mtopa = 3
    let mtopb = 0
    let mlefa = keys.length > 5 ? 10 : 60
    let mlefb = keys.length > 5 ? 20 : 70 
    let i = 0
    for(const k of keys){
        contents.push({
            textField:[
                {
                    value:"• ",
                    size:24,
                    color:colors[kcores[i]],
                    font:'HelveticaBold',
                    margin:{
                        left:mlefa,
                        top:mtopa,
                    }
                },
                {
                    value:`${k} - ${perfil.data[k]}%`,
                    size:11,
                    margin:{
                        left:mlefb,
                        top:mtopb,
                    }
                }
            ],
            height:150
        })
        mtopa += 16
        mtopb += 16
        i++
        if(i == 5){
            mlefa = 140
            mlefb = 150
            mtopa = 3
            mtopb = 0
        }
    }

    return {
        cols:{
            type:typeCols.VERTICAL,
            content:contents
        },
        height:200
    }
    
}

const getTemplateCol = () => {
    return {
        cols:{
            type:typeCols.HORIZONTAL,
            content:[]
        },
        height:250
    } 
}


const gen_questionario = (questionarios:questionario_data_i[]):Content[] => {

    const content:Content[] = [
        {
            text:{
                value:"Questionário Aplicado",
                size:24,
                color:"#0080FF",
                font:"HelveticaBold",
                margin:{
                    top:-20,
                    left:20
                }
            },
            height:20,
        },
    ]

    for(const questionario of questionarios){
        
        let questionario_content:Content[] = [
            {
                text:{
                    value:questionario.pergunta,
                    size:20,
                    margin:{
                        left: 20,
                        top:-10
                    }
                },
                height:30
            }
        ]

        let maior = questionario.options.reduce((max, option) => option.porcentagem > max.porcentagem ? option : max).porcentagem
        
        for(const option of questionario.options){
            
            let option_content:Content = {
                cols:{
                    type:typeCols.HORIZONTAL,
                    content:[
                        {
                            svg:createPesquisaHorizontalBar(570, 50, option.porcentagem, option.porcentagem == maior),
                            text:{
                                value:option.valor,
                                font:"HelveticaBold",
                                size:16,
                                margin:{
                                    left: 30,
                                    top:-20
                                }
                            },
                            height:50,
                            margin:{
                                left:20
                            }
                        },
                        {
                            text:{
                                value:option.porcentagem+"%",
                                size:18,
                                margin:{
                                    top:-20
                                }
                            },
                            height:50
                        }
                    ]
                },
                height:70
            }

            questionario_content.push(option_content)

        }

        content.push(...questionario_content)
        
    }

    return content

}


const perfil_pesquisa = (perfis:perfil_i[]) => {

    const perfils_legenda:Content[] = []

    let template_col:Content = getTemplateCol()

    let i = 0
    for(const perfil of perfis){
        if(i < 2 && template_col.cols){
            template_col.cols.content.push(template_legenda_pesquisa(perfil))
        }
        i++
        if(i > 1){
            i = 0
            perfils_legenda.push(template_col)
            if(template_col.cols)
                template_col = getTemplateCol()
        }
    }

    if(i == 1){
        perfils_legenda.push(template_col)
    }

    return [
        {
            text:{
                value:"Perfil dos Entrevistados",
                size:20,
                color:"#0080FF",
                font:"HelveticaBold",
                margin:{
                    left:20
                }
            },
            height:50
       },
       ...perfils_legenda
    ]

}

interface pesquisa_i {
    pesquisa_info:pesquisa_info_i,
    perfis:perfil_i[],
    questionarios:questionario_data_i[]
}

const genRelatorioPesquisa = (pesquisa:pesquisa_i):Promise<Uint8Array|undefined> => {

    const content = header_pesquisa(pesquisa.pesquisa_info)
    content.push(...perfil_pesquisa(pesquisa.perfis))
    content.push(...gen_questionario(pesquisa.questionarios))
    return createPDF(content)

}


export { genRelatorioPesquisa, pesquisa_i, pesquisa_info_i, perfil_i, questionario_data_i }