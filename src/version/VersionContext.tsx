import React, { useContext, useEffect, useState } from "react";
import axios from 'axios';
import { Children } from "../common/types/Helpers";
import { VERSION } from "./version";

export interface Version {
    version: number;
    releaseNotes: string;
}

export interface VersionContext {
    currentVersion: number;
    latestVersion?: Version;
}

const VersionContextObject: React.Context<VersionContext> = React.createContext(initialContextValue());

function initialContextValue(): VersionContext {
    return {
        currentVersion: VERSION
    };
}

export interface Props {
    children?: Children;
}

export function VersionContextProvider(props: Props) {
    const [ contextValue, setContextValue ] = useState<VersionContext>(initialContextValue());
    const [ fetchedVersion, setFetchedVersion ] = useState(false);

    useEffect(() => {
        if(!fetchedVersion) {
            setFetchedVersion(true);
            (async function() {
                const latestVersion = await fetchVersion();
                setContextValue({
                    ...contextValue,
                    latestVersion
                });
            })();
        }
    }, [ fetchedVersion, setFetchedVersion, contextValue, setContextValue ]);

    return (
        <VersionContextObject.Provider value={contextValue}>
            {props.children}
        </VersionContextObject.Provider>
    );
}

async function fetchVersion(): Promise<Version> {
    try {
        const response = await axios.get(`${process.env.PUBLIC_URL}/version.json?timestamp=${new Date().getTime()}`);
        return response.data;
    } catch(e) {
        return {
            version: 0,
            releaseNotes: "Initial version."
        }
    }
}

export function useVersionContext(): VersionContext {
    return useContext(VersionContextObject);
}
