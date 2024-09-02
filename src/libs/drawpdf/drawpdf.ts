import { Widget, Page, hexToRgb, convertSvgToPng, Text, Image } from "./Widget";
import { PDFDocument, rgb, PDFPage, StandardFonts } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import { createDonut } from '../SVGDrawn';
import { publicacao_stats } from "../../repositories/monitoramento.repo";

const logo = `
    <svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" 
    width="250px" height="150px" version="1.1" style="shape-rendering:geometricPrecision; text-rendering:geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd; clip-rule:evenodd"
    viewBox="0 0 250 150"
    xmlns:xlink="http://www.w3.org/1999/xlink">
        <g id="Camada_x0020_1">
            <rect width="100%" height="100%" fill="#0080FF" />
            <path fill="white" d="M208.35 77.68c6.41,0 9.16,0.95 14.36,4.03 1.5,0.82 2.91,1.77 4.23,2.83 -0.68,-1.5 -2.01,-3.35 -3.59,-4.11l1.21 -2.42 12.05 0 0 20.63 0 17.91 0 20.1 -12.91 0 -0.35 -1.77c1.68,-1.01 2.74,-1.78 3.29,-4.01 -1.04,0.82 -2.14,1.57 -3.29,2.24 -5.16,2.74 -8.56,3.78 -15,3.87 -16.38,0.23 -29.65,-13.27 -29.65,-29.65 0,-16.37 13.27,-29.65 29.65,-29.65zm-168.27 -0.87c14.68,0 26.68,12.01 26.68,26.69l0 32.61 -16.47 0 0 -30.78c0,-5.62 -4.59,-10.22 -10.21,-10.22 -5.62,0 -10.21,4.6 -10.21,10.22l0 30.78 -16.48 0 0 -32.61 0 -26.25 10.5 0 1.1 2.43c-2.49,1.63 -4.59,3.78 -4.59,5.83l0 0c4.89,-5.34 11.91,-8.7 19.68,-8.7zm142.62 59.8l-15.75 0.16 -11.77 -15.8 -0.16 -6.43 -17.77 22.04 -20.65 0.11 26.89 -32.33 -22.21 -26.65 15.15 0.01 18.61 23.59 -1.92 -8.38 11.9 -15.21 20.59 -0.03 -25.38 31.26 22.47 27.66zm-83.17 -59.8c10.78,0 20.24,5.7 25.52,14.25l-0.3 0.3 -11.77 11.78 -14.64 14.64 -6.82 0.08c1.77,1.44 3.08,2.08 4.36,2.37l0 0.01c0.48,0.14 0.97,0.24 1.48,0.32 0.7,0.11 1.42,0.17 2.17,0.17 3.16,0 6.07,-1.06 8.41,-2.83l4.76 4.84 6.53 6.63c-5.26,4.61 -12.16,7.4 -19.7,7.4 -16.57,0 -29.99,-13.42 -29.99,-29.98 0,-16.56 13.42,-29.98 29.99,-29.98zm10.39 18c-4.31,-1.6 -8.06,-2.53 -12.69,-1.77 -6.6,1.1 -11.64,6.83 -11.64,13.75 0,1.68 0.3,3.35 0.89,4.93l16.4 -16.1 7.04 -0.81zm84.59 12.52c0,7.64 6.2,13.84 13.84,13.84 7.92,0 15.22,-6.76 15.22,-14.83 0,-7.82 -6.34,-14.16 -14.16,-14.16 -7.97,0 -14.9,7.23 -14.9,15.15z"/>
            <path fill="#C2D9FF" d="M208.35 13.01c6.41,0 9.16,0.95 14.36,4.03 1.5,0.82 2.91,1.78 4.23,2.84 -0.68,-1.5 -2.01,-3.35 -3.59,-4.12l1.21 -2.42 12.05 0 0 20.63 0 17.91 0 20.1 -12.91 0 -0.35 -1.76c1.68,-1.02 2.74,-1.79 3.29,-4.01 -1.04,0.81 -2.14,1.56 -3.29,2.24 -5.16,2.73 -8.56,3.77 -15,3.86 -16.37,0.23 -29.65,-13.27 -29.65,-29.65 0,-16.37 13.27,-29.65 29.65,-29.65zm-100.56 0c6.41,0 9.16,0.95 14.37,4.03 1.49,0.82 2.9,1.78 4.22,2.84 -0.68,-1.5 -2.01,-3.35 -3.58,-4.12l1.21 -2.42 12.04 0 0 20.63 0 17.91 0 20.1 -12.91 0 -0.35 -1.76c1.68,-1.02 2.74,-1.79 3.29,-4.01 -1.04,0.81 -2.14,1.56 -3.29,2.24 -5.16,2.73 -8.56,3.77 -15,3.86 -16.37,0.23 -29.65,-13.27 -29.65,-29.65 0,-16.37 13.27,-29.65 29.65,-29.65zm-13.84 29.65c0,7.64 6.2,13.84 13.84,13.84 7.92,0 15.23,-6.76 15.23,-14.83 0,-7.82 -6.35,-14.16 -14.17,-14.16 -7.96,0 -14.9,7.24 -14.9,15.15zm54.18 -29.34l18.45 0 0 5.93 0 1.75 1.5 -0.01 13.02 -0.08 -6.68 11.61 -6.11 -0.03 -1.73 -3.55 0 5.22 0 1.42 0 36.38 -18.45 0 0 -37.1 0 -1.19 0 -4.48 -1.73 3.2 -4.2 -0.02 0 -11.21 5.92 -0.04 0.01 -1.87 0 -5.93zm-74.45 29.49c0,-16.22 -12.01,-29.49 -26.69,-29.49 -11.2,0 -22.4,0 -33.6,0l0 59.01 0.99 -0.04 32.61 0c14.68,0 26.69,-13.27 26.69,-29.48zm-41.97 -16.35l2.56 5.06 10.89 0c5.62,0 10.22,5.08 10.22,11.29 0,6.2 -4.6,11.26 -10.22,11.28l-10.69 0.06 -3.09 4.19 0.11 -6.81 0.22 -25.07zm162.8 16.2c0,7.64 6.2,13.84 13.84,13.84 7.92,0 15.22,-6.76 15.22,-14.83 0,-7.82 -6.34,-14.16 -14.16,-14.16 -7.97,0 -14.9,7.24 -14.9,15.15z"/>
        </g>
    </svg>

`


const h1 = (text:string) => {
    return  new Text({
        value:text,
        fontsize:30,
        align:{
            horizontal:'left',
            vertical:'center'
        }
    }, 500, 200)
}

const spaceV = (height:number) => {
    return new Widget(580, height)
}

const spaceH = (width:number) => {
    return new Widget(width, 20)
}

const p = (text:string, width:number, height:number) => {
    return new Text({
        value:text,
        fontsize:14,
        align:{
            horizontal:'left',
            vertical:'center'
        }
    }, width, height)
}

const square = (size:number, color:string) => {
    const w = new Widget(size, size)
    w.setBackgroundColor(hexToRgb(color))
    return w
}

const tag = (text:string, width:number, height:number, fontsize:number = 14) => {
    const t = new Text({
        value:text,
        fontsize:fontsize,
        color:hexToRgb("#ffffff"),
        align:{
            horizontal:'center',
            vertical:'center'
        }
    }, width, height)
    t.setPadding({x:20, y:20})
    t.setBackgroundColor(hexToRgb("#2f63f5"))
    return  t
}


const headerMonitoramento =  async (dataini:string, datafim:string) => {

    const binlog = await convertSvgToPng(logo)
    const logo_h = new Image(binlog, 84, 50);
    
    const text   = new Text({
        value:"Relatório de Monitoramento",
        fontsize:16,
        align:{
            horizontal:'center',
            vertical:'center'
        }
    }, 320, 50)

    text.setBackgroundColor(hexToRgb("#e3edff"))

    const datas   = new Text({
        value:`de: ${dataini} até: ${datafim}`,
        fontsize:10,
        align:{
            horizontal:'left',
            vertical:'center'
        }
    }, 190, 50)

    datas.setBackgroundColor(hexToRgb("#e3edff"))

    return { logo_h, text, datas }

}

const drawMonitoramentoReport = async (description:{hashtags:string, pesquisa:string, titulo:string, descricao:string, data_ini:string, data_fim:string}, medias:publicacao_stats[]) => {

    const pdfDoc = await PDFDocument.create();
    const page1  = new Page(pdfDoc, 595.28, 841.89)

    const { logo_h, text, datas } = await headerMonitoramento(description.data_ini, description.data_fim)

    const titulow = tag(description.titulo, 550, 300, 30)

    titulow.setPadding({x:40,y:0})

    const descipw = new Text({
        value:description.descricao,
        fontsize:18,
        align:{
            horizontal:'left',
            vertical:'top'
        }
    }, 500, 60)
    descipw.setPadding({x:40,y:0})

    const hashtags = p(`Hashtags: ${description.hashtags}`, 500, 30)
    hashtags.setPadding({x:40, y:0})
    const pesquisas = p(`Pesquisa: ${description.pesquisa}`, 500, 30)
    pesquisas.setPadding({x:40, y:0})

    page1.addWidgets([
        logo_h,
        text,
        datas,
        spaceV(20),
        new Text({
            value:"Análise de Sentimento de Publicações",
            fontsize:16,
            color:hexToRgb("#2f63f5")
        }, 500, 40).setPadding({x:40, y:0}),
        spaceV(10),
        titulow,
        spaceV(60),
        descipw,
        hashtags,
        pesquisas
    ])

    await page1.render();

    for(const media of medias){

        const mediaPage = new Page(pdfDoc, 595.28, 841.89)
        const { logo_h, text, datas } = await headerMonitoramento(description.data_ini, description.data_fim)

        const media_name = media.local[0].toUpperCase() + media.local.substring(1);

        const title = tag(media_name, 130, 50, 23)

        const total = media.negativos + media.neutros + media.positivos
        const ppos  = Math.ceil((100 * media.positivos) / total)
        const pneg  = Math.ceil((100 * media.negativos) / total)
        const pneu  = Math.ceil((100 * media.neutros)   / total)

        const svg = createDonut(media.local, 1200, [{ multiply: ppos, color: "verde" }, { multiply: pneu, color:'azul'}, { multiply: pneg, color:'vermelho'}], true);
        const imageWidget = new Image(await convertSvgToPng(svg), 400, 400);

        mediaPage.addWidgets([
            logo_h,
            text,
            datas,
            spaceV(60),
            title,
            imageWidget,
            spaceV(50),
            spaceH(20),
            square(20, "#ff4784"),
            spaceH(10),
            p(`Publicações Negativas: ${pneg}% - Total: ${media.negativos}`, 400, 20),
            spaceV(30),
            spaceH(20),
            square(20, "#00c9a7"),
            spaceH(10),
            p(`Publicações Positivas: ${ppos}% - Total: ${media.positivos}`, 400, 20),
            spaceV(30),
            spaceH(20),
            square(20, "#0081cf"),
            spaceH(10),
            p(`Publicações Neutras: ${pneu}% - Total: ${media.neutros}`, 400, 20)
        ])

        await mediaPage.render()

    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes
}


export { drawMonitoramentoReport }