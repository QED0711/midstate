import React, { createContext, Component } from "react";

import { bindMethods, createStateSetters, createReducerDispatchers } from "./helpers";


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
        this.reducers = {};
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

    addReducers(reducers) {
        this.reducers = reducers

    }

    addConstants(newConstants) {
        this.constants = { ...this.constants, ...newConstants }
    }

    addMethods(methods) {
        this.methods = methods;
    }

    connectToLocalStorage(options = {}) {
        this.bindToLocalStorage = true
        this.storageOptions = { ...DEFAULT_STORAGE_OPTIONS, ...options }

        if (!this.storageOptions.name) throw new Error("When connecting your Midstate instance to the local storage, you must provide an unique name (string) to avoid conflicts with other local storage parameters.")
    }

    clearStateFromStorage() {
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
        let reducers = this.reducers
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

                // set this.reducers to the reducered added in the Midstate Class 
                this.reducers = reducers
                // bind generatDispatchers
                this.generateDispatchers = this.generateDispatchers.bind(this);
                // Create reducers that are copies in name of the previously added reducers
                // Then, give a dispatch method to each that will execute the actual reducer
                this.reducersWithDispatchers = this.generateDispatchers(reducers)
                
                this.methods = bindMethods(methods, this);

                this.bindToLocalStorage = bindToLocalStorage;
                this.storageOptions = storageOptions;

                this.updateStateFromLocalStorage = this.updateStateFromLocalStorage.bind(this);

                // Save master version of setState prior to reassignment
                this.setStateMaster = this.setState;

                // Reassign setState function to return a promise, and by default, handle localStorage changes
                this.setState = function (state, callback = () => {}) {
                    return new Promise(resolve => {
                        this.setStateMaster(state, () => {
                            this.bindToLocalStorage && localStorage.setItem(this.storageOptions.name, JSON.stringify(this.state))
                            callback(this.state)
                            resolve(this.state)
                        })
                    })
                }

                this.setState = this.setState.bind(this);
            }

            // dispatch(reducerKey) {
            //     return function (state, action) {
            //         this.setState(this.reducers[reducerKey](state, action))
            //     }
            // }

            generateDispatchers(reducers) {
                const reducersWithDispatchers = {}
                
                // define a dispatcher factory to handle the creation of new dispatchers
                const dispatcherFactory = function(reducerKey){
                    return function (state, action) {
                        this.setState(this.reducers[reducerKey](state, action))
                    }
                }

                let dispatch;
                for (let reducer in reducers) {
                    dispatch = dispatcherFactory(reducer).bind(this);
                    reducersWithDispatchers[reducer] = { dispatch }
                }

                return reducersWithDispatchers
            }

            updateStateFromLocalStorage() {
                try {
                    this.setState({ ...this.state, ...JSON.parse(localStorage[storageOptions.name]) })
                } catch (err) {
                    const updatedState = typeof localStorage[storageOptions.name] === "string"
                        ?
                        { ...this.state, ...JSON.parse(localStorage[storageOptions.name]) }
                        :
                        { ...this.state }

                    this.setState(updatedState, () => {
                        localStorage.setItem(storageOptions.name, JSON.stringify(this.state))
                    })
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

            render() {
                const value = {
                    state: this.state,
                    setters: this.setters,
                    constants: constants,
                    methods: this.methods
                }

                if (Object.keys(reducers).length) value.reducers = this.reducersWithDispatchers

                return (
                    <Context.Provider value={value}>
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

