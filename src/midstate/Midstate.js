import React, { createContext, Component } from "react";

import { bindMethods, createStateSetters } from "./helpers";


const DEFAULT_OPTIONS = {
    dynamicSetters: true,
    allowSetterOverwrite: true,
    developmentWarnings: true,
    overwriteProtectionLevel: 1,
    bindToLocalStorage: false
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
        this.bindToLocalStorage = this.options.bindToLocalStorage


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

    createProvider() {
        // copy instance properties/methods
        const Context = this.context;
        const state = this.state;
        const bindToLocalStorage = this.bindToLocalStorage;
        let constants = this.constants
        let methods = this.methods;
        let setters;


        if (this.allowSetterOverwrite) {
            setters = this.dynamicSetters ? { ...createStateSetters(state, bindToLocalStorage), ...this.setters } : { ...this.setters };
        } else {
            let dynamicSetters = createStateSetters(state)
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
            setters = this.dynamicSetters ? { ...createStateSetters(state, bindToLocalStorage), ...this.setters } : { ...this.setters };
        }

        // define Provider class
        class Provider extends Component {
            constructor(props) {
                super(props);
                this.state = state
                this.setters = bindMethods(setters, this);
                this.methods = bindMethods(methods, this);

                this.bindToLocalStorage = bindToLocalStorage;

                this.updateStateFromLocalStorage = this.updateStateFromLocalStorage.bind(this);
                this.setStateAndStorage = this.setStateAndStorage.bind(this);
            }

            setStateAndStorage(state) {
                this.setState(state)

                for(let key in state){
                    localStorage.setItem(key, state[key]);
                }
            }

            updateStateFromLocalStorage() {
                this.setState({ ...this.state, ...localStorage })
            }

            componentDidMount() {
                // When component mounts, if bindToLocalStorage has been set to true, make the window listen for storage change events and update the state 
                if (bindToLocalStorage) {
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

