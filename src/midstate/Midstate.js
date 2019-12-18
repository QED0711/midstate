import React, { createContext, Component } from "react";


import { bindMethods, createStateSetters } from "./helpers";


class Midstate {
    constructor(state, stateSetters={}, options={}) {
        this.context = createContext(null);
        this.state = state;
        this.stateSetters = stateSetters;

        // options
        this.dynamicSetters = options.dynamicSetters === false ? false : true;
        this.allowPolymorphism = options.allowPolymorphism === false ? false : true;
    }

    createProvider() {
        // copy instance properties/methods
        const Context = this.context;
        const state = this.state;
        let setters;

        if(this.allowPolymorphism) {
            setters = this.dynamicSetters ? {...createStateSetters(state), ...this.stateSetters} : {...this.stateSetters};
        } else {
            let dynamicSetters = createStateSetters(state)
            const dynamicKeys = Object.keys(dynamicSetters);

            for(let key of Object.keys(this.stateSetters)){
                if(dynamicKeys.includes(key)){
                    delete this.stateSetters[key]
                }
            }
            console.log(this.stateSetters)
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
                    <Context.Provider value={{ state: this.state, setters: this.stateSetters }}>
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

