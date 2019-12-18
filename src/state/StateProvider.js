
import Midstate from '../midstate/Midstate';

const state = {
    title: "TITLE",
    username: ""
}

const setters = {
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


const midstate = new Midstate(state, setters, {dynamicSetters: true, allowPolymorphism: false}) 

midstate.addProviderValue({myValue: 5})

export const StateContext = midstate.context
export const StateProvider = midstate.createProvider() 