import React, { createContext, Component } from "react";


import { bindMethods, createStateSetters } from "./helpers";


const OPTIONS = {
    dynamicSetters: true,
    allowPolymorphism: true,
    developmentWarnings: true
}

class Midstate {
    constructor(state, stateSetters={}, options={}) {
        this.context = createContext(null);
        this.state = state;
        this.stateSetters = stateSetters;

        this.values = {}

        // options
        this.options = {...OPTIONS, ...options}
        this.dynamicSetters = this.options.dynamicSetters
        this.allowPolymorphism = this.options.allowPolymorphism
        this.developmentWarnings = this.options.developmentWarnings
        console.log(this.options)
    }

    addProviderValue(newValue){
        this.values = {...this.values, ...newValue}
    }

    createProvider() {
        // copy instance properties/methods
        const Context = this.context;
        const state = this.state;
        let values = this.values
        let setters;

        if(this.allowPolymorphism) {
            setters = this.dynamicSetters ? {...createStateSetters(state), ...this.stateSetters} : {...this.stateSetters};
        } else {
            let dynamicSetters = createStateSetters(state)
            const dynamicKeys = Object.keys(dynamicSetters);

            for(let key of Object.keys(this.stateSetters)){
                if(dynamicKeys.includes(key)){
                    delete this.stateSetters[key]
                    
                    this.developmentWarnings
                    &&
                    console.warn(`The user defined setter, '${key}', has been prevented from overwriting a dynamically generated setter of the same name. To change this behavior, set allowPolymorphism to true in the Midstate options.`)
                }
            }
            setters = this.dynamicSetters ? {...createStateSetters(state), ...this.stateSetters} : {...this.stateSetters};

        }

        // define Provider class
        class Provider extends Component {
            constructor(props) {
                super(props);
                this.state = state
                this.stateSetters = bindMethods(setters, this);
            }

            render() {
                return (
                    <Context.Provider value={{ state: this.state, setters: this.stateSetters, values: values }}>
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

