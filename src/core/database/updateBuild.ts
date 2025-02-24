

export default <T extends Object>(obj:T, table:string, where:string[] = [], ignore:string[] = []):string => {
    
    const campos = Object.keys(obj)
    let execstr = `update ${table} set `

    for(const campo of campos){
        if(campo != "id" && !ignore.includes(campo))
        execstr += `${campo} = ?, ` 
    }
    execstr = execstr.substring(0, execstr.length -2)+' '
    execstr += `where ${where.map(val => `${val} = ?`).join(` and `)}`

    return `${execstr.trim()};`

}