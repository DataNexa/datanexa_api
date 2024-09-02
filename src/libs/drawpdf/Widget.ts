import { PDFDocument, rgb, PDFPage, StandardFonts } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { createDonut } from '../SVGDrawn';

type coordinate = { x: number, y: number };
type color = { r: number, g: number, b: number, a?: number };

function hexToRgb(hex: string): color  {
    hex = hex.replace(/^#/, '');
    if (hex.length !== 6 && hex.length !== 3) {
        return { r:0, g:0, b:0};
    }
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
}

async function convertSvgToPng(svg: string): Promise<Uint8Array> {
    const buffer = Buffer.from(svg);
    const pngBuffer = await sharp(buffer).png().toBuffer();
    return new Uint8Array(pngBuffer);
}

class Widget {

    protected posX: number = 0;
    protected posY: number = 0;
    protected cursor: coordinate = { x: 0, y: 0 };
    protected width: number;
    protected height: number;
    protected backgroundColor?: color;
    protected padding: coordinate = { x: 0, y: 0 };
    protected margin: coordinate = { x: 0, y: 0 };
    protected list: Widget[] = [];

    constructor(width: number = 0, height: number = 0) {
        this.width = width;
        this.height = height;
    }

    setBackgroundColor(bg: color) {
        this.backgroundColor = bg;
        return this
    }

    setPadding(padding: coordinate) {
        this.padding = padding;
        return this
    }

    setMargin(margin: coordinate) {
        this.margin = margin;
        return this
    }

    addWidgets(widgets: Widget[]) {

        this.cursor = { x: this.posX + this.padding.x, y: this.posY - this.padding.y };
        let maiorAltura = 0

        for (const widget of widgets) {

            if (this.width - this.cursor.x < widget.width) {
                this.cursor.y -= maiorAltura - Math.ceil(this.padding.y / 2) - Math.ceil(widget.padding.y / 2);
                this.cursor.x = this.posX + Math.ceil(this.padding.x / 2) + Math.ceil(widget.padding.x / 2);
                maiorAltura = 0
            }

            widget.addPos(this.cursor);
            this.list.push(widget);

            this.cursor.x += widget.width + this.margin.x;
            maiorAltura = widget.height > maiorAltura ? widget.height : maiorAltura
            
        }

    }

    private addPos(pos: coordinate) {
        this.posX = pos.x;
        this.posY = pos.y;
    }

    async render(page: PDFPage) {
        if (this.backgroundColor) {
            page.drawRectangle({
                x: this.posX,
                y: this.posY - this.height,
                width: this.width,
                height: this.height,
                color: rgb(this.backgroundColor.r / 255, this.backgroundColor.g / 255, this.backgroundColor.b / 255),
            });
        }

        for (const widget of this.list) {
            await widget.render(page);
        }
    }
}

class Page extends Widget {

    private pdfDoc: PDFDocument;
    private page: PDFPage;

    constructor(pdfDoc: PDFDocument, width: number = 595.28, height: number = 841.89) {
        super(width, height);
        this.pdfDoc = pdfDoc;
        this.page = pdfDoc.addPage([width, height]);
        this.posX = 0;
        this.posY = height;
    }

    async render() {
        await super.render(this.page);
    }

    getPDFPage() {
        return this.page;
    }

}

type text = {
    value: string;
    fontsize?: number;
    color?: color;
    align?: {
        horizontal?: 'left' | 'center' | 'right';
        vertical?: 'top' | 'center' | 'bottom';
    };
};

class Text extends Widget {

    texto: text;

    constructor(texto: text, width: number = 100, height: number = 100) {
        super(width, height);
        this.texto = texto;
    }

    async render(page: PDFPage) {

        await super.render(page);

        const { value, fontsize = 12, color = { r: 0, g: 0, b: 0 }, align = {} } = this.texto;
        const { horizontal = 'left', vertical = 'bottom' } = align;

        const font = await page.doc.embedFont(StandardFonts.Helvetica);

        const palavras = value.split(' ');
        let lines: string[] = [];
        let currentLine = '';

        for (const palavra of palavras) {
            const testLine = currentLine ? `${currentLine} ${palavra}` : palavra;
            const testWidth = font.widthOfTextAtSize(testLine, fontsize);

            if (testWidth > this.width) {
                lines.push(currentLine);
                currentLine = palavra;
            } else {
                currentLine = testLine;
            }
        }

        if (currentLine) {
            lines.push(currentLine);
        }

        const textWidth = Math.max(...lines.map(line => font.widthOfTextAtSize(line, fontsize)));
        const textHeight = font.heightAtSize(fontsize);
        const totalTextHeight = textHeight * lines.length;
        
        let alignX = this.posX;
        let alignY = this.posY - this.height;

        switch (horizontal) {
            case 'center':
                alignX += (this.width - textWidth) / 2;
                break;
            case 'right':
                alignX += this.width - textWidth;
                break;
        }

        switch (vertical) {
            case 'center':
                alignY += (this.height - totalTextHeight) / 2;
                break;
            case 'top':
                alignY += this.height - totalTextHeight;
                break;
        }

        lines.forEach((line, index) => {
            page.drawText(line, {
                x: alignX,
                y: alignY - index * textHeight,
                size: fontsize,
                color: rgb(color.r / 255, color.g / 255, color.b / 255),
                font: font,
            });
        });
    }
}

class Image extends Widget {

    private imageData: Uint8Array;

    constructor(imageData: Uint8Array, width: number = 100, height: number = 100) {
        super(width, height);
        this.imageData = imageData;
    }

    async render(page: PDFPage) {
        const image = await page.doc.embedPng(this.imageData);
        page.drawImage(image, {
            x: this.posX,
            y: this.posY - this.height,
            width: this.width,
            height: this.height,
        });
    }
}

async function test() {

    const pdfDoc = await PDFDocument.create();
    const page = new Page(pdfDoc, 595.28, 841.89);

    const svg = createDonut("1", 600, [{ multiply: 50, color: "verde" }, { multiply: 50, color:'azul'}], true);
    const imageWidget = new Image(await convertSvgToPng(svg), 100, 100);

    const textWidget = new Text({
        value: 'Hello World!',
        fontsize: 24,
        color: { r: 255, g: 0, b: 255 },
    }, 200, 50);

    const textWidget2 = new Text({
        value: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
        fontsize: 6,
        color: { r: 255, g: 0, b: 255 },
        align:{
            vertical:'top'
        }
    }, 595.28, 50);

    textWidget2.setBackgroundColor({ r: 100, g: 100, b: 100 })

    textWidget.setBackgroundColor({ r: 0, g: 0, b: 0 });

    page.addWidgets([imageWidget, textWidget, textWidget2]);

    await page.render();

    const pdfBytes = await pdfDoc.save();

    fs.writeFileSync(path.join(__dirname, 'document.pdf'), pdfBytes);

}

export { Widget, Page, hexToRgb, convertSvgToPng, Text, Image };