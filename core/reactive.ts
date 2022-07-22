
import { DependenceType, PropType, ReactiveType, WatcherDepenciesType, WatcherType } from "./types";



const refToSymbolMap = new Map()

function getReactiveSymbol(ref: object){

    if ( refToSymbolMap.has(ref)) return refToSymbolMap.get(ref)

    let symbol = Symbol()
    refToSymbolMap.set(ref, symbol)

    return symbol
}



let __watcher_running = false



let __watchers:Array<WatcherDepenciesType> = []
// This has list of watchers with the dependencies as and object {watcher: Fn, dependencies:Map<symbol, Set<string|symbol>>}
// This is where all watchers registed using the watch(callback) function are stored


let __watcher_dependecies:DependenceType = new Map()
// This is a map with key as a symbol of reactive and value as a set of props belonging to the reactive object
// When a watcher callback is been executed the reactives and their corresponding data it is depending on (uses) are been stored here to update it dependences later inside watchers


function watch(callback:WatcherType, violate =false){
    /**
     * This allows one to watch on changes on the content of a reactive object whose watchGlobal = true , and runs the @callback function every time the data is modified or changed. This also does dependences tracking, which means it will only listen to changes on data used inside the @callback function.
     * 
     * @callback Function which gets called when it dependences content is modified
     * 
     * ! Note 1: Avoid modifying reactive data content inside the callback/watchers and computed properties, though this is done automatically, meaning when the @callback function is been executed, watchers will not be executed whenever the function modifies the content of a reactive data
     * 
     */

    let multipleWatcher = false
    if(__watcher_running == false ){
        __watcher_dependecies.clear()

    }else{
        multipleWatcher = true
    }
    if (!violate)__watcher_running = true 

    // The two above line is needed, 
    // 1: TO clean the last watchers dependences that was be recored
    // 2: To notify the changeListeners, not boardcast as a watcher is about to be executed: Reed (Note 1) for more clearification to why

    callback()
    if(multipleWatcher == false) __watcher_running = false


    let watcher:WatcherDepenciesType = {
        watcher : callback,
        dependencies : copyDependences(__watcher_dependecies)
    }
    // Adding the new watcher to the list
    __watchers.push(watcher)
}

function copyDependences(dependencies:Map<Symbol, Set<PropType>>){

    let copy:Map<Symbol, Set<PropType>> = new Map()

    let keys = Array.from(dependencies.keys())

    keys.forEach(function(key){
        let value = dependencies.get(key)
        if(value) copy.set(key, value);

    })
    
    

    return copy
}


function __globalSetListener(ref:ReactiveType, prop:PropType,newValue:any,  oldValue:any) {
    /**
     * This function is a global change listener, and is incharge of knowing which reactive item was changed, what property was changed and executing the watchers that were watching those properties.
     * 
     * @ref The reactive data
     * @prop The property of the reactive data @ref been changed(modified)
     * @newValue The new value been changed to
     * @oldValue The previous value been changed from
     */

    // Avoid infinite recursive loop, when reactive object are been modified by a watcher
    // This insure that no changes are been watched when a watcher is been executed read (Note 1) for clearification

    if(__watcher_running) return 

    // Identify the reactive object been modified
    let reactiveSymbol = getReactiveSymbol(ref)

    // loop through all the wacthers and check those who have the reactive object @reactiveSymbol as a dependences and checj if the property been motified is watched

    for ( let watcher of __watchers){
        let dependencies = watcher.dependencies
        
        if (dependencies.has(reactiveSymbol)) {
            let watchingProps = dependencies.get(reactiveSymbol)

            if (watchingProps && watchingProps.has(prop)){

                __watcher_running = true
                __watcher_dependecies = new Map()
                watcher.watcher()
                watcher.dependencies = copyDependences(__watcher_dependecies)
                __watcher_running = false
                
            }
        }
        
        
    }

}

function __globalGetListener(ref:object, prop:PropType){

    // only track dependencies if a watcher is currently been run
    if(!__watcher_running) return

    let symbol = getReactiveSymbol(ref)

    //  Check if the reactive is already in the current dependencies list,
    // if not add it
    
    if (!__watcher_dependecies.has(symbol)) {
        
        __watcher_dependecies.set(symbol, new Set())
    }
    let propSet = __watcher_dependecies.get(symbol)

    propSet?.add(prop)


}

function reactive<T>( data:T,   watcher?: (key:String|symbol, newValue:any, oldValue:any)=>null|void,looselyCoupled?:Boolean){
    /**
     * This function create a reactive data that changes can be watched and listen to changes done on @data , it returns an proxy object of @data
     * [params]
     * @data This is the data object that is to be watched 
     * @watchGlobal This is needed for using the watch function, this allows the global watcher to listen and excecute watchers that are listening on any data in the data object
     * @watcher This allows one to add a general watcher that get executed when ever a data is changed (it does not matter if the data changed is a dependence or not)
     */
    
    let mirror = data
    let  watchGlobal = true;
    
    if(looselyCoupled && looselyCoupled == true){
        mirror = Object.create(null)
        for (const key of Object.keys(data)) {
            (mirror as any)[key] = (data as any )[key]
        }
    } 

    

    let proxy = new Proxy((mirror as any), {

        get: function(target, prop, handler){

            if (target[prop] == undefined) throw Error(
                "Sorry you are trying to access the key '"+(prop as string)+"' that was not initialize into a reactive object"
            )

            __globalGetListener(proxy, prop)

            return target[prop]
        },
        set: function(target, prop, value, handler){

            let oldValue = target[prop]

            if (oldValue == undefined) throw Error(
                "Sorry you are trying to set value to the key '"+(prop as string)+"' that was not initialize into a reactive object"
            )
            
            if ( oldValue == value) return true

            target[prop] = value
            if(watcher) watcher(prop, value, oldValue)

            if(watchGlobal)__globalSetListener(proxy, prop, value, oldValue)
            
            return true
        }
    })

    return (proxy as T)
}

function ref<T>(data : T ):{value:T}{
    /**
     * Returns a reactive object which data is accessable via the "value" key
     * This is sutable for primitive data type such as Number and String
     * 
     * Example
     * 
     * let age = ref(20)
     * age.value = 30
     * console.log(`Age is ${age.value}`)
     * 
     */
    let r = reactive({value:data})
    
    return r
}

// Yet to be completed
function computed<T>(func: ()=>T){
    /**
     * Returns a ref reactive object of type {value: T}
     * This allows one to create a dynamically auto updating reactive that the update it self with the value of @func function when ever there has been update on dependences of @func
     */
    let firstContent = func()
    let copy = ref(firstContent)

    watch(function(){
        let value = func()
        copy.value = value
    })

    return copy

}

export default reactive

export {
    watch,
    ref,
}