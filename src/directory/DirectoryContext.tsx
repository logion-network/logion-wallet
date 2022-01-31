import React, { useContext, useEffect, useState } from "react";
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

export function DirectoryContextProvider(props: Props) {
    const [ contextValue, setContextValue ] = useState<DirectoryContext>(initialContextValue());
    const [ fetched, setFetched ] = useState(false);

    useEffect(() => {
        if(!fetched) {
            setFetched(true);
            (async function() {
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

                const saveOfficer = async (legalOfficer: LegalOfficer): Promise<void> => {
                    const tokens = loadTokens();
                    const api = new DirectoryApi(tokens.get(legalOfficer.address)?.value);
                    await api.createOrUpdate(legalOfficer);
                };

                setContextValue({
                    legalOfficers,
                    isLegalOfficer,
                    getOfficer,
                    directoryFailure,
                    saveOfficer
                });
            })();
        }
    }, [ fetched, setFetched, contextValue, setContextValue ]);

    return (
        <DirectoryContextObject.Provider value={contextValue}>
            {props.children}
        </DirectoryContextObject.Provider>
    );
}

export function useDirectoryContext(): DirectoryContext {
    return useContext(DirectoryContextObject);
}
