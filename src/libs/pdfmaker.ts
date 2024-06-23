import { PDFDocument, rgb,  PDFPage, StandardFonts } from 'pdf-lib';
import fs from 'fs'
import sharp from 'sharp';


interface Margin {
    left?:number,
    top?:number
}

interface Text {
    value:string,
    size:number,
    font?:string,
    margin?:Margin,
    color?:string
}

enum typeCols {
    VERTICAL, HORIZONTAL
}

interface col {
    type:typeCols,
    content:Content[]
}

interface Content {
    cols?:col,
    text?:Text,
    textField?:Text[],
    svg?:string,
    margin?:Margin,
    background?:string,
    height:number
}

function hexToRgb(hex:string) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255; 
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    return { r, g, b };
}

async function convertSvgToPng(svg: string): Promise<Buffer> {
    const buffer = Buffer.from(svg);
    const pngBuffer = await sharp(buffer).png().toBuffer();
    return pngBuffer;
}


class Document {

    private width:number 
    private height:number

    private dinamic_height:number = 0

    private cursor_x:number = 0
    private cursor_y:number = 0

    private cursor_x_start:number = 0
    private cursor_y_start:number = 0

    private pdfDoc?:PDFDocument
    private pages:PDFPage[] = []
    private pageI:number = 0

    constructor(margin:Margin = { }){

        this.width    = 595
        this.height   = 842
        
        this.cursor_x_start = margin.left ? margin.left : 0
        this.cursor_y_start = margin.top ? this.height - margin.top : this.height

        this.cursor_y = this.cursor_y_start
        this.cursor_x = this.cursor_x_start

    }


    async createPDFDocument(){

        this.pdfDoc = await PDFDocument.create()

        if(this.pages.length == 0){
            this.pages.push(this.pdfDoc.addPage([this.width, this.height]))
        }

    }

    addPage(){
        if(this.pdfDoc){
            this.pages.push(this.pdfDoc.addPage([this.width, this.height]))
            this.pageI++
        }
    }

    async getFont(font:string){
        if(font == "Courier"){
            return StandardFonts.Courier
        } else
        if(font == "CourierBold") {
            return StandardFonts.CourierBold
        } else
        if(font == "Helvetica") {
            return StandardFonts.Helvetica
        } else 
        if(font == "HelveticaBold") {
            return StandardFonts.HelveticaBold
        } else{
            return StandardFonts.Helvetica
        }
    }

    async paintBackground(color:string, x:number, y:number, width:number, height:number){
        
        if(!this.pdfDoc){
            await this.createPDFDocument()
        }
        
        this.pages[this.pageI].drawRectangle({
            x,
            y,
            width,
            height,
            opacity: 1,
            color:(() => {
                const {r,g,b} = hexToRgb(color)
                return rgb(r,g,b)
            })()
        })
    }

    async drawTextField(texts:Text[], height:number){
        if(!this.pdfDoc){
            await this.createPDFDocument()
        }

        for(const text of texts){
            await this.drawText(text, height)
        }
    }

    async drawText(text:Text, height:number){
        
        if(!this.pdfDoc){
            await this.createPDFDocument()
        }

        const font = text.font ? 
            await this.pdfDoc?.embedFont(await this.getFont(text.font)) : 
            await this.pdfDoc?.embedFont(StandardFonts['Helvetica']) ;

        const color = text.color ?
            (() => {
                const { r, g, b} = hexToRgb(text.color)
                return rgb(r,g,b)
            })() : 
            rgb(0, 0, 0)

        this.pages[this.pageI].drawText(text.value, {
            size:text.size,
            font:font,
            x: this.cursor_x + (text.margin && text.margin.left ? text.margin.left : 0),
            y: this.cursor_y - height - (text.margin && text.margin.top ? text.margin.top : 0),
            color:color
        });

    }

    async drawSVG(svg:string, height:number, margin?:Margin){
        
        if(!this.pdfDoc){
            await this.createPDFDocument()
        }
        
        const pngBuff  = await convertSvgToPng(svg)  
        const pngFinal = await this.pdfDoc?.embedPng(pngBuff);
        
        if(pngFinal){
            this.pages[this.pageI].drawImage(pngFinal, {
                x: this.cursor_x + (margin && margin.left ? margin.left : 0),
                y: this.cursor_y - height - (margin && margin.top ? margin.top : 0),
            })
        }

    }

    async drawContent(content:Content, defineHeight:boolean = true){

        if(defineHeight) this.dinamic_height = content.height

        if(content.svg){
            await this.drawSVG(content.svg, content.height, content.margin)
        }
        if(content.text){
            await this.drawText(content.text, content.height)
        }
        if(content.textField){
            await this.drawTextField(content.textField, content.height)
        }
    }


    async drawList(col:col){
        
        for(const c of col.content){
            if(c.cols && c.cols.type == typeCols.HORIZONTAL){
                await this.defineCols(c.cols, c.height, c.background)
            } else {
                await this.drawContent(c, false)
            }
        }

    }

    checkNewPage(){
        if(this.cursor_y < this.dinamic_height){
            this.addPage()
            this.cursor_x = this.cursor_x_start 
            this.cursor_y = this.cursor_y_start
        }
    }

    async defineCols(col:col, height:number, background?:string){

        this.cursor_x = this.cursor_x_start
        const w_col = (this.width - this.cursor_x) / col.content.length
        
        for(const c of col.content){
            if(background){
                await this.paintBackground(background, this.cursor_x, this.cursor_y - height, w_col, c.height)
            }
            if(c.cols && c.cols.type == typeCols.VERTICAL){
                await this.drawList(c.cols)
            } else {
                await this.drawContent(c, false)
            }
            this.cursor_x += w_col

        }

    }

    async defineRows(col:col, redefine:boolean = true){

        for(const c of col.content){
            
            this.dinamic_height = c.height

            this.checkNewPage()

            if(c.cols && c.cols.type == typeCols.HORIZONTAL) {
                await this.defineCols(c.cols, c.height, c.background)
            } else {
                await this.drawContent(c)
            }

            this.cursor_y -= this.dinamic_height

            if(redefine){
                this.cursor_x  = this.cursor_x_start
            }

        }
        
    }

    async draw(content:Content){

        if(content.background){
            await this.paintBackground(content.background, this.cursor_x, this.cursor_y, this.width, this.height)
        }

        if(content.cols && content.cols.type == typeCols.VERTICAL){
            this.dinamic_height = content.height
            await this.defineRows(content.cols)
        } else
        if(content.cols && content.cols.type == typeCols.HORIZONTAL){
            await this.defineCols(content.cols, content.height)
        } else {
            await this.drawContent(content)
        }

        if(this.pdfDoc){
            const pdfBytes = await this.pdfDoc.save();
            fs.writeFileSync('./test.pdf', pdfBytes)
        }

    }

}


class PDFMaker {

    private content:Content = { height: 200 }
    private document:Document

    constructor(margin:Margin = {}){
        this.document = new Document(margin)
    }

    defineContent(content:Content){
        this.content = content
    }

    async draw(){
        await this.document.draw(this.content)
    }

}


async function createPDF(content:Content[]){

    const pdf = new PDFMaker()
    pdf.defineContent({
        cols:{
            type:typeCols.VERTICAL,
            content:content
        },
        height:100
    })
    await pdf.draw()

}


export {createPDF, typeCols, Content}