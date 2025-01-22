class Data {

    private data?:Date
    private brdate:string = ""
    private endate:string = ""
    private time:boolean = false

    constructor(data?:string|null|Date){
        if(data) {
            if(typeof(data) == 'string'){
                data = data.trim()
            }
            this.data = new Date(data)
            if(isNaN(this.data.getTime())){
                this.data = undefined
            }
        }
    }

    public humanDate(){
        
    }

    private getSplitedDate(){
        if(!this.data) return [0,0,0]
        return [ 
            this.data.getUTCDate().toString().padStart(2, '0'), 
            (this.data.getUTCMonth() + 1).toString().padStart(2, '0'), 
            this.data.getUTCFullYear() 
        ]
    }

    private getSplitedTime(){
        if(!this.data) return [0,0,0]
        return [
            this.data.getUTCHours().toString().padStart(2, '0'), 
            this.data.getUTCMinutes().toString().padStart(2, '0'), 
            this.data.getUTCSeconds().toString().padStart(2, '0')
        ]
    }

    public toEn(time:boolean = false){
        
        if(!this.data) return undefined

        if(this.endate != "" && this.time == time){
            return this.endate
        }

        let [dia,mes,ano] = this.getSplitedDate()
        let datafinal = `${ano}-${mes}-${dia}`

        if(time){
            let [horas,minutos,segundos] = this.getSplitedTime()
            datafinal += ` ${horas}:${minutos}:${segundos}`
        }

        this.time = time
        this.endate = datafinal

        return this.endate
    }

    public toBr(time:boolean = false){
    
        if(!this.data) return undefined

        if(this.brdate != "" && this.time == time){
            return this.brdate
        }

        let [dia,mes,ano] = this.getSplitedDate()
        let datafinal = `${dia}/${mes}/${ano}`

        if(time){
            let [horas,minutos,segundos] = this.getSplitedTime()
            datafinal   += ` ${horas}:${minutos}:${segundos}`
        }

        this.time = time
        this.brdate = datafinal

        return this.brdate
    }

    public timestamp(){
        return this.data?.getTime()
    }
}

function dateToBr(dataEn:string|null|Date, time:boolean = false){
    const data = new Data(dataEn)
    return data.toBr(time)
}

function dateToEn(dataBr:string|null|Date, time:boolean = false){
    const data = new Data(dataBr)
    return data.toEn(time)
}

export { Data, dateToBr, dateToEn }