
import { drawMonitoramentoReport } from "../libs/drawpdf/drawpdf"

const init = async () => {
   await drawMonitoramentoReport(
      {
         titulo:'Monitoramento Betinho Condutores de São Paulo e Capital',
         descricao:'Analise das redes sociais e possiveis ataques à pessoa',
         data_ini:'20/08/2002',
         data_fim:'20/08/2003',
         hashtags:"#test #test2 #test3",
         pesquisa:"Uma pesquisa simples",
      },
      [
         {
            type:'facebook',
            positivos: 10,
            negativos: 20,
            neutros:2
         },
         {
            type:'instagram',
            positivos: 30,
            negativos: 20,
            neutros:30
         },
         {
            type:'youtube',
            positivos: 5,
            negativos: 20,
            neutros:10
         },
         {
            type:'twitter',
            positivos: 5,
            negativos: 20,
            neutros:10
         },
         {
            type:'web',
            positivos: 10,
            negativos: 2,
            neutros:1
         }
      ]
   )
}

init()
