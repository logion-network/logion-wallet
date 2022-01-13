import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useMediaQuery } from 'react-responsive';

export interface Rules {
    onSmallScreen: string;
    otherwise: string;
}

export interface ResponsiveContext {
    width: (rule: Rules) => string;
}

export interface FullResponsiveContext extends ResponsiveContext {
    isSmallScreen: boolean;
    initialized: boolean;
}

const DEFAULT_CONTEXT_STATE: FullResponsiveContext = {
    isSmallScreen: false,
    width: (rules: Rules) => rules.otherwise,
    initialized: false,
}

const ResponsiveContextObject: React.Context<ResponsiveContext> = createContext<ResponsiveContext>(DEFAULT_CONTEXT_STATE);

export interface Props {
    children: ReactNode;
}

export function ResponsiveProvider(props: Props) {
    const isSmallScreen = useMediaQuery({ maxWidth: 1350 });
    const [ state, setState ] = useState<FullResponsiveContext>(DEFAULT_CONTEXT_STATE);

    useEffect(() => {
        if(!state.initialized || state.isSmallScreen !== isSmallScreen) {
            setState({
                isSmallScreen,
                initialized: true,
                width: (rules) => widthFunction(isSmallScreen, rules)
            });
        }
    }, [ state, isSmallScreen, setState ]);

    return (
        <ResponsiveContextObject.Provider value={ state }>
            { props.children }
        </ResponsiveContextObject.Provider>
    )
}

export function useResponsiveContext() {
    return useContext(ResponsiveContextObject)
}

function widthFunction(isSmallScreen: boolean, rules: Rules): string {
    if(isSmallScreen) {
        return rules.onSmallScreen;
    } else {
        return rules.otherwise;
    }
}
