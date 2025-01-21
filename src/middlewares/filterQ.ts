import { Request, Response, NextFunction } from 'express'
import { FilterQuery } from '../types/FilterQuery';

export const filterQ = (req: Request, res: Response, next: NextFunction) => {
    const { query } = req;
    const parsedQuery: FilterQuery = {
        filters: {},
        sort: [],
        ignoredParams: [],
        limit:10,
        offset:0,
        search:''
    };
  
    Object.keys(query).forEach((key) => {
        if (key.startsWith('filter[') && key.endsWith(']')) {
            const filterKey = key.slice(7, -1);
            if (filterKey) {
                parsedQuery.filters![filterKey] = query[key];
            }
        } else if (key === 'sort') {
            parsedQuery.sort = (query[key] as string).split(',');
        } else if (key === 'limit' || key === 'offset') {
            parsedQuery[key] = parseInt(query[key] as string, 10) || 0;
        } else if (key === 'search'){
                  
        } else {
            parsedQuery.ignoredParams.push(key);
        }
    });
  
    req.body.parsedQuery = parsedQuery;
  
    next();
};