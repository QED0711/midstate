import React, { createContext, Component } from "react";

import { bindMethods, createStateSetters } from "./helpers";


const DEFAULT_OPTIONS = {
    dynamicSetters: true,
    allowSetterOverwrite: true,
    developmentWarnings: true,
    overwriteProtectionLevel: 1,
}

const DEFAULT_STORAGE_OPTIONS = {
    name: null,
    unmountBehavior: "all"
}

class Midstate {
    constructor(state, options = {}) {
        this.context = createContext(null);
        this.state = state;

        this.setters = {};
        this.constants = {}
        this.methods = {}

        // OPTIONS
        this.options = { ...DEFAULT_OPTIONS, ...options }

        this.dynamicSetters = this.options.dynamicSetters
        this.allowSetterOverwrite = this.options.allowSetterOverwrite
        this.developmentWarnings = this.options.developmentWarnings
        this.overwriteProtectionLevel = this.options.overwriteProtectionLevel
        
        // Local Storage Connection
        this.bindToLocalStorage = false


    }

    addCustomSetters(setters) {
        this.setters = setters
    }

    addConstants(newConstants) {
        this.constants = { ...this.constants, ...newConstants }
    }

    addMethods(methods) {
        this.methods = methods;
    }

    connectToLocalStorage(options={}){
        this.bindToLocalStorage = true
        this.storageOptions = {...DEFAULT_STORAGE_OPTIONS, ...options}

        if(!this.storageOptions.name) throw new Error("When connecting your Midstate instance to the local storage, you must provide an unique name (string) to avoid conflicts with other local storage parameters.")
    }

    createProvider() {
        // copy instance properties/methods
        const Context = this.context;
        const state = this.state;
        let constants = this.constants
        let methods = this.methods;

        const bindToLocalStorage = this.bindToLocalStorage;
        const storageOptions = this.storageOptions
        let setters;

        // initialize local storage with state
        localStorage.setItem(storageOptions.name, JSON.stringify(state))


        // Pre class definition setup
        if (this.allowSetterOverwrite) {
            setters = this.dynamicSetters ? { ...createStateSetters(state, bindToLocalStorage, storageOptions.name), ...this.setters } : { ...this.setters };
        } else {
            let dynamicSetters = createStateSetters(state, bindToLocalStorage, storageOptions.name)
            const dynamicKeys = Object.keys(dynamicSetters);

            for (let key of Object.keys(this.setters)) {
                if (dynamicKeys.includes(key)) {

                    if (this.developmentWarnings) {

                        this.overwriteProtectionLevel === 1
                            &&
                            console.warn(`The user defined setter, '${key}', was blocked from overwriting a dynamically generated setter of the same name. To change this behavior, set allowSetterOverwrite to true in the Midstate options.`)

                        if (this.overwriteProtectionLevel >= 2) {
                            throw new Error(`The user defined setter, '${key}', was blocked from overwriting a dynamically generated setter of the same name. To change this behavior, set allowSetterOverwrite to true in the Midstate options.`)
                        }


                    }
                    delete this.setters[key]
                }
            }
            setters = this.dynamicSetters ? { ...createStateSetters(state, bindToLocalStorage, storageOptions.name), ...this.setters } : { ...this.setters };
        }

        // define Provider class
        class Provider extends Component {
            constructor(props) {
                super(props);
                this.state = state
                this.setters = bindMethods(setters, this);
                this.methods = bindMethods(methods, this);

                this.bindToLocalStorage = bindToLocalStorage;
                this.storageOptions = storageOptions;

                this.setStorageState = this.setStorageState.bind(this);
                this.setStorageStateAsync = this.setStorageStateAsync.bind(this);
                this.updateStateFromLocalStorage = this.updateStateFromLocalStorage.bind(this);
            }

            setStorageState(newState) {
                const updatedState = {...this.state, ...newState}
                
                this.setState(updatedState)
                localStorage.setItem(this.storageOptions.name, JSON.stringify(updatedState))
            }
            
            setStorageStateAsync(newState) {
                const updatedState = {...this.state, ...newState}
                return new Promise(resolve => {
                    localStorage.setItem(this.storageOptions.name, JSON.stringify(updatedState))
                    this.setState(updatedState, () => {
                        resolve(this.state)
                    })
                })
            }
            

            updateStateFromLocalStorage() {
                try{
                    this.setState({ ...this.state, ...JSON.parse(localStorage[storageOptions.name]) })
                } catch(err){
                    // console.log(err)
                }
            }

            componentDidMount() {
                // When component mounts, if bindToLocalStorage has been set to true, make the window listen for storage change events and update the state 
                if (bindToLocalStorage && !window.onstorage) {
                    window.onstorage = e => {
                        this.updateStateFromLocalStorage();
                    }
                }
            }

            componentWillUnmount() {
                if (bindToLocalStorage) {
                    window.onstorage = null;
                }
            }

            render() {
                return (
                    <Context.Provider value={{ state: this.state, setters: this.setters, constants: constants, methods: this.methods }}>
                        {this.props.children}
                    </Context.Provider>
                )
            }
        }

        // return provider class
        return Provider;
    }
}

export default Midstate;

