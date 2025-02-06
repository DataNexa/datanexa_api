import { Request, Response, NextFunction } from 'express'
import { FilterQuery } from '../types/FilterQuery';
import transform from '../util/SearchTransform';

export const filterQueryMid = (req: Request, res: Response, next: NextFunction) => {

    const { query } = req;

    const parsedQuery: FilterQuery = {
        filters: {},
        fields:[],
        sort: [],
        ignoredParams: [],
        limit:10,
        offset:0,
        search:'',
        client_id:0,
        desc:true
    };
    
    Object.keys(query).forEach((key) => {
   
        if (key.startsWith('filter(') && key.endsWith(')')) {
            const filterKey = key.slice(7, -1);
            if (filterKey) {
                parsedQuery.filters![filterKey] = query[key];
            }
        } else if (key === 'sort') {
            parsedQuery.sort = (query[key] as string).split(',');
        } else if (key === 'limit' || key === 'offset') {
            let val = parseInt(query[key] as string, 10) || 0;
            if(key == 'limit'){
                if(val > 50) val = 50 
                else if(val == 0) val = 10 
            }
            parsedQuery[key] = val
        } else if (key === 'search'){
            const searchValue = decodeURIComponent(query[key] as string);
            parsedQuery[key] = transform(searchValue)
        } else if (key === 'client_id' && query[key]) {
            parsedQuery[key] = parseInt(query[key] as string) || 0
        } else if (key === 'fields') {
            const fieldsArr = (query[key] as string).split(",").map(val => val.trim())
            parsedQuery[key] = fieldsArr
        } else {
            parsedQuery.ignoredParams.push(key);
        }

    });
  
    req.body.parsedQuery = parsedQuery;
  
    next();

};