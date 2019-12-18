
import Midstate from '../midstate/Midstate';

const state = {
    title: "TITLE",
    username: ""
}

const stateSetters = {
    setTitleAndUsername: function(){
        this.setState({
            title: "This is a custom title",
            username: "NEW USERNAME"
        })
    },

    setTitle: function(){
        this.setState({title: "BOOM"})
    }
}


const midstate = new Midstate(state, stateSetters, {dynamicSetters: true, allowPolymorphism: true}) 

export const StateContext = midstate.context
export const StateProvider = midstate.createProvider() 