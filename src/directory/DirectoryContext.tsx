import React, { Reducer, useCallback, useContext, useEffect, useReducer, useState } from "react";
import { loadLegalOfficers, loadTokens, storeLegalOfficers } from "../common/Storage";
import { Children } from "../common/types/Helpers";
import { DirectoryApi, LegalOfficer } from "./DirectoryApi";

export interface DirectoryContext {
    legalOfficers: LegalOfficer[];
    isLegalOfficer: (address: string | undefined) => boolean;
    getOfficer: (address: string | undefined) => LegalOfficer | null;
    directoryFailure: boolean;
    saveOfficer: (legalOfficer: LegalOfficer) => Promise<void>;
}

const DirectoryContextObject: React.Context<DirectoryContext> = React.createContext(initialContextValue());

function initialContextValue(): DirectoryContext {
    return {
        legalOfficers: [],
        isLegalOfficer: () => false,
        getOfficer: () => null,
        directoryFailure: false,
        saveOfficer: () => Promise.resolve()
    };
}

export interface Props {
    children?: Children;
}

interface FetchResult {
    directoryFailure: boolean;
    legalOfficers: LegalOfficer[];
    isLegalOfficer: (address: string | undefined) => boolean;
    getOfficer: (address: string | undefined) => LegalOfficer | null;
}

async function fetchLegalOfficers(): Promise<FetchResult> {
    const api = new DirectoryApi();
    let legalOfficers: LegalOfficer[];
    let directoryFailure: boolean;
    try {
        legalOfficers = await api.getLegalOfficers();
        storeLegalOfficers(legalOfficers);
        directoryFailure = false;
    } catch(error) {
        console.log("Directory unreachable, using stored data.");
        legalOfficers = loadLegalOfficers();
        directoryFailure = true;
    }

    const isLegalOfficer = (address: string | undefined): boolean => {
        if(address === undefined) {
            return false;
        } else {
            return legalOfficers.map(lo => lo.address).includes(address);
        }
    };

    const getOfficer = (address: string | undefined): LegalOfficer | null => {
        if(address === null) {
            return null;
        }
    
        for(let i = 0; i < legalOfficers.length; ++i) {
            const legalOfficer = legalOfficers[i];
            if(legalOfficer.address === address) {
                return legalOfficer;
            }
        }
        return null;
    };

    return {
        directoryFailure,
        legalOfficers,
        isLegalOfficer,
        getOfficer
    };
}

type ActionType = 'SET_SAVE_OFFICER'
    | 'SET_DATA'
;

interface Action {
    type: ActionType;
    saveOfficer?: (legalOfficer: LegalOfficer) => Promise<void>;
    fetchResult?: FetchResult;
}

const reducer: Reducer<DirectoryContext, Action> = (state: DirectoryContext, action: Action): DirectoryContext => {
    switch(action.type) {
        case 'SET_SAVE_OFFICER': {
            return {
                ...state,
                saveOfficer: action.saveOfficer!,
            }
        }
        case 'SET_DATA': {
            return {
                ...state,
                ...action.fetchResult!,
            }
        }
        default:
            /* istanbul ignore next */
            throw new Error(`Unknown type: ${action.type}`);
    }
}

export function DirectoryContextProvider(props: Props) {
    const [ contextValue, dispatch ] = useReducer(reducer, initialContextValue());
    const [ fetched, setFetched ] = useState(false);

    const refresh = useCallback(async () => {
        const fetchResult = await fetchLegalOfficers();
        dispatch({
            type: "SET_DATA",
            fetchResult,
        })
    }, [ dispatch ]);

    const saveOfficer = useCallback(async (legalOfficer: LegalOfficer) => {
        const tokens = loadTokens();
        const api = new DirectoryApi(tokens.get(legalOfficer.address)?.value);
        await api.createOrUpdate(legalOfficer);
        await refresh();
    }, [ refresh ]);

    useEffect(() => {
        if(contextValue.saveOfficer !== saveOfficer) {
            dispatch({
                type: "SET_SAVE_OFFICER",
                saveOfficer
            })
        }
    }, [ contextValue, saveOfficer, dispatch ]);

    useEffect(() => {
        if(!fetched) {
            setFetched(true);
            refresh();
        }
    }, [ fetched, setFetched, refresh ]);

    return (
        <DirectoryContextObject.Provider value={contextValue}>
            {props.children}
        </DirectoryContextObject.Provider>
    );
}

export function useDirectoryContext(): DirectoryContext {
    return useContext(DirectoryContextObject);
}
