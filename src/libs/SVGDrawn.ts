
function pxToMm(px: number): number {
    return px * 0.2645833;
}

function mmToPx(mm:number): number {
    return mm / 0.2645833
}


const colors:{[key:string]:string} = {
    vermelho:"#ff4784",
    amarelo:"#ffc75f",
    azul:"#0081cf",
    verde:"#00c9a7",
    laranja:"#ff8066",
    violeta:"#d65db1",
    agua:"#51aff7",
    salmao:"#ff6f91",
    grama:"#008f7a",
    roxo:"#845ec2",
}

const generate_svg = (width:number, height:number, svg:string) => {
    
    const k_colors = Object.keys(colors)
    let style      = ""

    for (let i = 0; i < k_colors.length; i++) {
        const key = k_colors[i];
        style += `.${key} { fill: ${colors[key]}; }
        `
    }

    return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        ${svg}
        <style>
        ${style}
        </style>
    </svg>
    `
}

interface donut_i {
    multiply:number,
    color:string
}

function generateDonutPath(size: number, id: string, percentage: number): string {
    
    const outerRadius = size / 2;
    const innerRadius = outerRadius / 2;

    // Calcula o centro do SVG
    const centerX = outerRadius;
    const centerY = outerRadius;

    // Calcula o ângulo total em radianos correspondente à porcentagem
    const totalAngle = (percentage / 100) * 2 * Math.PI;

    const endOuterX = centerX + outerRadius * Math.cos(totalAngle - Math.PI / 2);
    const endOuterY = centerY + outerRadius * Math.sin(totalAngle - Math.PI / 2);

    const endInnerX = centerX + innerRadius * Math.cos(totalAngle - Math.PI / 2);
    const endInnerY = centerY + innerRadius * Math.sin(totalAngle - Math.PI / 2);


    const largeArcFlag = percentage > 50 ? 1 : 0;

    const svgPath = `

        <path id="${id}" d="
            M ${centerX},${centerY - outerRadius}
            A ${outerRadius},${outerRadius} 0 ${largeArcFlag},1 ${endOuterX},${endOuterY}
            L ${endInnerX},${endInnerY}
            A ${innerRadius},${innerRadius} 0 ${largeArcFlag},0 ${centerX},${centerY - innerRadius}
            Z"/>

    `;

    return svgPath;
}

function createDonut( id:string, size:number, elements:donut_i[]|number[], emMilimetros:boolean = false) {
    
    if(emMilimetros){
        size = pxToMm(size)
    }

    const rotate_pattern = 3.6;
    id = `rosquinha_${id}`
    
    let rotate = 0
    let svg_donut= `<defs>
            `
    let svg_uses = `<g>
            `
    let label_colors = Object.keys(colors)

    for (let i = 0; i < elements.length; i++) {
        let el = elements[i]
        if( typeof el == "number"){
            svg_donut += `${ generateDonutPath(size, `${id}${i}`, el) }`
            svg_uses  += `<use xlink:href="#${id}${i}" transform="rotate(${rotate} ${size / 2} ${size / 2})" class="${label_colors[i]}"/>
            `
            rotate    += rotate_pattern * el
        } else {
            svg_donut += `${ generateDonutPath(size, id, el.multiply) }`
            svg_uses  += `<use xlink:href="#${id}${i}" transform="rotate(${rotate} ${size / 2} ${size / 2})" class="${el.color}"/>
            `
            rotate    += rotate_pattern * el.multiply
        }
    }

    svg_donut += `
        </defs>

        `
    svg_uses += `
        </g>

    `
    return generate_svg(size, size, svg_donut+svg_uses)
    
}


function createPesquisaHorizontalBar(width:number, height:number, percent:number, success:boolean = false){

    percent       = percent > 100 ? 100 : percent

    let color     = success ? "#cafae5" : "#cfd4d4"
    let str_color = success ? "#038a5d" : "#6e7070"
    let w_percent = Math.floor(width * percent / 100)

    return `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="${w_percent}" height="${height - 1}" fill="${color}" stroke="${str_color}" stroke-width="1" />
        </svg>
    `

}


export { createDonut, createPesquisaHorizontalBar, colors }