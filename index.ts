import reactive, { ref, watch } from "./core/reactive";

let name = ref("innocent Peros")

let profile = reactive({
    age: 22, country: "Nigeria"
})

watch(function(){
    console.log("You just updated your name to "+name.value)
})

watch( function(){
    if (profile.age > 25){
        console.log(`Your age is ${profile.age} and your currently in ${profile.country}`)
    }
})


profile.age = 30
name.value = "Innocent Saidu Peros"

