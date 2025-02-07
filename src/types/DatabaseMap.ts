type FieldTable = {
    [key:string]:string
}   

type DatabaseMap = {

    table:string,
    fields:FieldTable,
    fieldsSerch?:FieldTable,
    join?:string[],
    otherFields?:string[]

}

export { DatabaseMap,FieldTable }