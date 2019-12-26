
import Midstate from '../midstate/Midstate';

const state = {
    title: "TITLE",
    username: "",
    MY_CONSTANT: "CONSTANT",
    _dontChangeThis: "OTHER CONSTANT"
}

const setters = {
    setTitleAndUsername: function(){
        const newState = {
            title: "This is a custom title",
            username: "NEW USERNAME"
        }

        this.setStateAndStorage(newState)
    },

    setTitle: function(){
        this.setState({title: "MY AWESOME TITLE"})
    }
}

const methods = {
    logThis: function(){
        console.log(this)
    },
    
    contrivedSetState: function(){
        this.setters.setTitle(JSON.stringify(new Date().toJSON()))
    }
}


const midstate = new Midstate(state, {
    dynamicSetters: true, 
    allowSetterOverwrite: false, 
    overwriteProtectionLevel: 1,
}) 

midstate.connectToLocalStorage({name: "myState"})

midstate.addCustomSetters(setters)
midstate.addConstants({myValue: 5, myOtherValue: 10})
midstate.addMethods(methods)

export const StateContext = midstate.context
export const StateProvider = midstate.createProvider() 