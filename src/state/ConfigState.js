import Midstate from '../midstate/Midstate';

const state = {
    title: "My Title",
    titleColor: "black",
    backgroundColor: "blue"
}

const setters = {
    setTitleColor(titleColor){
        this.setStorageState({titleColor})
    }
}

const config = new Midstate(state)

config.addCustomSetters(setters)
config.connectToLocalStorage({name: "config-state"})


export const ConfigContext = config.context
export const ConfigProvider = config.createProvider()