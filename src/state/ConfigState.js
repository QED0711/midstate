import Midstate from '../midstate/Midstate';

const state = {
    title: "My Title",
    backgroundColor: "blue"
}

const config = new Midstate(state)

config.connectToLocalStorage({name: "config-state"})


export const ConfigContext = config.context
export const ConfigProvider = config.createProvider()