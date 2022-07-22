# How to use this reactive system
> *This is inspire by the vue 3 compositional API*

It is similar to the Vue 3 compositional API, it exposes four(4) functions which are
* reactive   ```  This is the default export```
* ref
* watch
* computed

## Using Reactive function
This function has signature three (3) signature  
* ` reactive(data:object)`
* ` reactive(data:object, watcher:(property:Symbol|String, newValue:any, oldValue:any )=>void|null,)`
* `reactive(data:object, watcher:(property:Symbol|String, newValue:any, oldValue:any )=>void|null, watchGlobal = true,looselyCoupled?:Boolean)`
  

>This function allows you to create a reactive object, and listen to modification on the data.

### Example (First Function)

This function is used internally by the other exported functions and is usually not of much use externally if no watchers are been used.

```typescript

import reactive from "./core/reactive";

let data = {
    name:"Innocent Peros",
    age: 10
}



let reactive_data = reactive(data)

reactive_data.name = "Innocent Saidu Peros"
reactive_data.age = 30

console.log(data)
```

*Note the reactive and the data object are tightly coupled. Meaning any changes done on the reactive object will be reflected on the main data object*

### Example (Function 2)

This function is designed to allow a user provide a type of a watcher function as the second parameter that get called anytime the properties of the reactive object is modified.

```ts

import reactive, { watch } from "./core/reactive";

let data = {
    name:"Innocent Peros",
    age: 10
}



let reactive_data = reactive(data, function(property, newValue, oldValue){

    console.log(`You have changed ${(property as String)} from ${oldValue} to ${newValue}`)
    
})


reactive_data.name = "Innocent Saidu Peros"
reactive_data.age = 30

console.log(data)

```

[^1]: Reactive object are objects that can be watched for data modification to it properties.


Reactive Object
: Reactive object are objects that can be watched for data modification to it properties.



### Example (Function 3)

This function is similar to the second example but, it allows the original data and the reactive object to be uncouple (loosely couple). Meaning, any changes to the reactive object does not reflect in the orignal data object
, this is true if the third parameter is set as true
```ts
import reactive from "./core/reactive";

let data = {
    name:"Innocent Peros",
    age: 10
}



let reactive_data = reactive(data, function(property, newValue, oldValue){

    console.log(`You have changed ${(property as String)} from ${oldValue} to ${newValue}`)
    
}, true)


reactive_data.name = "Innocent Saidu Peros"
reactive_data.age = 30

console.log({
    orignalData:data,
    reactiveData:reactive_data
})
```
>This function signature is useful when you need to listen to any and all mofidication occuring on the reactive object


## Using Watcher with Watch()
This allows the user to register multiple watchers which get executed only when the properties they are depending on is modified. 

>**!Note** A watcher is always executed the first time it is registered so that it dependences are recorded and registered correctly


```ts

import reactive,{watch} from "./core/reactive"

let information = reactive({
    name:"Innocent",
    age:20
})

watch( function(){
    console.log(`Your name is now ${information.name}`)
})

watch( function(){
    console.log(`Your age is now ${information.age}`)
})

information.name ="Innocent Peros"
information.age = 21


```
> If you notice the first watcher get executed only if the name property of information is modified, also thesame for the second watcher it only get executed when the age property of information is modified.

## Using Ref Function
This allows one to create reactive object for premitve data type that is not an object, example `Sting` and `Number` but when accessing or modifying the value you are to use the .value property

### Example

```ts

import { ref, watch } from "./core/reactive";

let name = ref("Innocent")
let age = ref(20)


watch(function(){
    console.log("Hi")
    if (age.value >30) {
        console.log(`yeah ${name.value}, Your old enough`)
    }
})

// changes to name does not trigger the watcher
// cause name is not in the dependences of the watcher 

name.value ="Peros"
name.value ="Saidu"
// Changes to age does trigger the watcher
// changes to name will only trigger if age is greater then 30

age.value = 31
name.value ="Innocent Saidu Peros"


```
>Ref gives you the freedom of having different state as different reactive object

