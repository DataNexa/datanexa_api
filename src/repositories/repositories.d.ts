interface response_data {
    error:boolean,
    error_message?:string,
    error_code?:number,
    insertId?:number,
}

interface result_exec {
    insertId:number,
    affectedRows:number
}

export { response_data, result_exec }