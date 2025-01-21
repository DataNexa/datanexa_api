
type FilterQuery = {

    filters:{[key:string]},
    sort:string[],
    limit:number,
    offset:number,
    search:string|Search,
    ignoredParams:string[]

}


export { FilterQuery }