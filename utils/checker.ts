

export function isNumber(value:any){

    if( value == null || value == undefined){
        return false
    }
    if ( typeof value == "string") return false

    return !isNaN(value)
}

export function isString(value:any){
    if(isNumber(value)) return false 
    if ( typeof value == 'string') return true

    if ( value.contructor){
        if (value.contructor === String ) return true
    }

    return false
}

export function isArray(value:any){
    return Array.isArray(value)
}

export function isObject(value: any){

    if ( isArray(value)) return false

    if ( isNumber(value)) return false

    if ( isString(value)) return false

    return true
}

