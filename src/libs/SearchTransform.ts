
/**
 * Regras
 * 
 * exemplo:
 * search=+palavra1+palavra2 palavra3 -palavra4 +palavra5
 * 
 * palavras combinadas é "palavra1 palavra2"
 * palavras obrigatorias "palavra1 palavra2" e "palavra5"
 * palavras que podem ter "palavra3"
 * palavra que não pode ter "palavra4"
 * 
 */

import { Search } from "../types/Search"


function join(word:string):string{
    return word.split("+").join(" ").trim()
}

function transform(text:string):Search {

    const parts = text.trim().split(" ")
    const obj:Search = {
        obrigatorias:[],
        podeTer:[],
        naoPodemTer:[]
    }

    for(let part of parts){
        if(part[0] == '+'){
            obj.obrigatorias.push(join(part))
            continue
        }
        if(part[0] == '-'){
            obj.naoPodemTer.push(join(part.slice(1)))
            continue
        }
        obj.podeTer.push(join(part))
    }

    return obj
}

export default transform