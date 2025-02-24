import { Search } from "./Search"

type FilterQuery = {

    filters:{[key:string]:any},
    fields:string[],
    sort:string[],
    limit:number,
    offset:number,
    search:string|Search,
    ignoredParams:string[],
    client_id:number,
    desc:boolean

}


export { FilterQuery }