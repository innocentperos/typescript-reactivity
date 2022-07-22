

type DependenceType = Map<Symbol, Set<PropType>>

type WatcherType = ()=>any
type PropType = string | Symbol

type WatcherDepenciesType = {
    watcher: WatcherType,
    dependencies: DependenceType
}

type ReactiveType = object


export {
    DependenceType,
    WatcherDepenciesType,
    WatcherType,
    PropType,
    ReactiveType
}