
import Midstate from '../midstate/Midstate';

const state = {
    title: "TITLE",
    username: "",
    MY_CONSTANT: "CONSTANT",
    _dontChangeThis: "OTHER CONSTANT"
}

const setters = {
    setTitleAndUsername: function(){
        this.setState({
            title: "This is a custom title",
            username: "NEW USERNAME"
        })
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


const midstate = new Midstate(state, {dynamicSetters: true, allowSetterOverwrite: false, overwriteProtectionLevel: 1}) 

midstate.addCustomSetters(setters)
midstate.addConstants({myValue: 5, myOtherValue: 10})
midstate.addMethods(methods)

export const StateContext = midstate.context
export const StateProvider = midstate.createProvider() 