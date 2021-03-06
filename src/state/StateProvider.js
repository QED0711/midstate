
import Midstate from '../midstate/Midstate';


// :::::::::::
// :: STATE ::
// :::::::::::
const state = {
    title: "TITLE",
    username: "",
    MY_CONSTANT: "CONSTANT",
    _dontChangeThis: "OTHER CONSTANT"
}

// :::::::::::::
// :: SETTERS ::
// :::::::::::::
const setters = {
    setTitleAndUsername(){
        const newState = {
            title: "This is a custom title",
            username: "NEW USERNAME"
        }
        
        this.setStorageState(newState)
    },
    
    // async setTitle(){
    //     const myState = await this.setStorageStateAsync({title: "MY AWESOME TITLE"})
    //     console.log(myState)
    // }
}

// :::::::::::::
// :: METHODS ::
// :::::::::::::
const methods = {
    logThis: function(){
        console.log(this)
    },
    
    contrivedSetState: function(){
        this.setters.setTitle(JSON.stringify(new Date().toJSON()))
    }
}


// ::::::::::::::::::::
// :: INITIALIZATION ::
// ::::::::::::::::::::
const midstate = new Midstate(state, {
    dynamicSetters: true, 
    allowSetterOverwrite: true, 
    overwriteProtectionLevel: 1,
}) 

midstate.connectToLocalStorage({name: "newState"})

midstate.addCustomSetters(setters)
midstate.addConstants({myValue: 5, myOtherValue: 10})
midstate.addMethods(methods)



// :::::::::::::
// :: EXPORTS ::
// :::::::::::::
export const msInstance = midstate
export const StateContext = midstate.context
export const StateProvider = midstate.createProvider() 