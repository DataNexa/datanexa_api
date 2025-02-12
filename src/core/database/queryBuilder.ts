import { DatabaseMap, FieldTable } from "../../types/DatabaseMap";
import { FilterQuery } from "../../types/FilterQuery";
import { Search } from "../../types/Search";

const searchBuilder = (fieldSearch: FieldTable, search: Search | string, where: boolean = true) => {
   
    let vals: any[] = []

    let searchNormalize: Search = typeof (search) == 'string' ? {
        obrigatorias: [search],
        podeTer: [],
        naoPodemTer: []
    } : search

    const clausulas: string[] = []

    if (searchNormalize.obrigatorias.length > 0) {
        clausulas.push(
            searchNormalize.obrigatorias
                .map(palavra => `(${Object.values(fieldSearch).map(campo => {
                    vals.push(`%${palavra}%`)
                    return `${campo} LIKE ?`
                }).join(' OR ')})`)
                .join(' AND ')
        );
    }

    if (searchNormalize.podeTer.length > 0) {
        clausulas.push(
            `(${searchNormalize.podeTer
                .map(palavra => `(${Object.values(fieldSearch).map(campo => {
                    vals.push(`%${palavra}%`)
                    return `${campo} LIKE ?`
                }).join(' OR ')})`)
                .join(' OR ')})`
        );
    }

    if (searchNormalize.naoPodemTer.length > 0) {
        clausulas.push(
            searchNormalize.naoPodemTer
                .map(palavra => `(${Object.values(fieldSearch).map(campo => {
                    vals.push(`%${palavra}%`)
                    return `${campo} NOT LIKE ?`
                }).join(' AND ')})`)
                .join(' AND ')
        );
    }

    return { search: `${where ? "WHERE " : ""}${clausulas.join(' AND ')}`, values: vals }

}

const joinBuilder = (table: string, joins: string[]) => {
    
    let strjoin = ``
    for (const join of joins) {
        if(join[0] == '>'){
            let stjoin = join.substring(1,join.length)
            strjoin += `JOIN ${stjoin} ON ${stjoin}.id = ${table}.${stjoin}_id `
        } else {
            strjoin += `JOIN ${join} ON ${join}.${table}_id = ${table}.id `
        }
    }
    
    return strjoin;
};

export default (map: DatabaseMap, filter: FilterQuery): { query: string, values: any[] } | false => {
    
    let qstring = `SELECT `
    const fields = map.fields ?? {}
    const join = map.join ? joinBuilder(map.table, map.join) : ""
    const vals: any = []

    qstring += (filter.fields.length === 0)
        ? `${Object.keys(fields).map(key => `${fields[key]} as ${key}`).join(', ')} `
        : `${fields.id} as id, ${filter.fields.filter(fld => fld !== 'id' && fields[fld]).map(fld => `${fields[fld]} as ${fld}`).join(', ')} `

    qstring += map.otherFields && map.otherFields.length > 0 ? `, ${map.otherFields.join(', ')} ` : ''

    qstring += `FROM ${map.table} ${join} `

    let whereStats = false

    if (filter.filters && Object.values(filter.filters).length > 0) {
        qstring += `WHERE `
        whereStats = true

        for (const fild of Object.keys(filter.filters)) {
            if (!map.fields[fild]) {
                console.log(`O campo: ${fild} não está sendo referenciado no map:DatabaseMap em fields`);
                
                return false
            }
            vals.push(filter.filters[fild])
            qstring += `${map.fields[fild]} = ? AND `
        }

        qstring = qstring.substring(0, qstring.length - 4)
    }

    if (filter.search && map.fieldsSerch) {
        const valsSearch = searchBuilder(map.fieldsSerch, filter.search, whereStats)
        if (valsSearch.search) {
            qstring += (whereStats ? ' AND ' : ' WHERE ') + valsSearch.search
        }
        vals.push(...valsSearch.values)
    }

    if (filter.sort.length > 0) {
        const validSortFields = filter.sort.filter(sort => fields[sort]);
        if (validSortFields.length > 0) {
            qstring += `ORDER BY ${validSortFields.map(sort => fields[sort]).join(', ')} `
        }
    } else {
        qstring += `ORDER BY ${fields.id} `
    }

    qstring += filter.desc ? `DESC ` : `ASC `

    qstring += `LIMIT ${filter.offset}, ${filter.limit}`

    console.log(qstring);
    

    return { query: qstring, values: vals }
};