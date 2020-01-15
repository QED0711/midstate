import Midstate from '../midstate/Midstate';

const state = {
    title: "My Title",
    titleColor: "black",
    backgroundColor: "blue"
}

const setters = {
    async setTitleColor(color){
        const {titleColor} = await this.setState({titleColor: color})
        // console.log({titleColor})
    }
}

const config = new Midstate(state)

config.addCustomSetters(setters)
config.connectToLocalStorage({name: "config-state"})

export const ConfigContext = config.context
export const ConfigProvider = config.createProvider()