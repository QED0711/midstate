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
        
        // initialize blank storageOptions (will be populated later if user chooses)
        this.storageOptions = {}

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

    clearStateFromStorage(){
        const handleUnload = e => {
            this.storageOptions.name && localStorage.removeItem(this.storageOptions.name)
        }
        window.onbeforeunload = handleUnload
        window.onunload = handleUnload
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
        storageOptions.name && localStorage.setItem(storageOptions.name, JSON.stringify(state))


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

        // define Provider class component
        class Provider extends Component {
            constructor(props) {
                super(props);
                this.state = state
                this.setters = bindMethods(setters, this);
                this.methods = bindMethods(methods, this);

                this.bindToLocalStorage = bindToLocalStorage;
                this.storageOptions = storageOptions;

                this.setStorageState = this.setStorageState.bind(this);
                this.updateStateFromLocalStorage = this.updateStateFromLocalStorage.bind(this);

                
            }

            setStorageState(newState) {
                const updatedState = {...this.state, ...newState}
                return new Promise(resolve => {
                    this.setState(updatedState, () => {
                        localStorage.setItem(this.storageOptions.name, JSON.stringify(this.state))
                        resolve(this.state)
                    })
                })
            }
            
            updateStateFromLocalStorage() {
                try{
                    this.setState({ ...this.state, ...JSON.parse(localStorage[storageOptions.name]) })
                } catch(err){
                    try{
                        const updatedState = typeof localStorage[storageOptions.name] === "string"
                        ?
                        { ...this.state, ...JSON.parse(localStorage[storageOptions.name]) }
                        :
                        { ...this.state }
    
                        this.setState(updatedState, () => {
                            localStorage.setItem(storageOptions.name, JSON.stringify(this.state))
                        })
                    } catch(error){
                        // do nothing
                    }
                }
            }

            componentDidMount() {
                // When component mounts, if bindToLocalStorage has been set to true, make the window listen for storage change events and update the state 
                // if the window is already listening for storage events, then do nothing
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
                    <Context.Provider value={{ 
                        state: this.state, 
                        setters: this.setters, 
                        constants: constants, 
                        methods: this.methods 
                    }}>
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

