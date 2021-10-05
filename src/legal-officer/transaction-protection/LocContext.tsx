import { UUID } from "../../logion-chain/UUID";
import React, { useContext, useReducer, Reducer, useEffect, useCallback } from "react";
import { LocRequest } from "../../common/types/ModelTypes";
import { useCommonContext } from "../../common/CommonContext";
import { getLegalOfficerCase, addMetadata } from "../../logion-chain/LogionLoc";
import { LegalOfficerCase } from "../../logion-chain/Types";
import { useLogionChain } from "../../logion-chain";
import { SignAndSubmit } from "../../ExtrinsicSubmitter";
import { SignAndSendCallback } from "../../logion-chain/Signature";


export interface LocContext {
    locId: UUID
    locRequest: LocRequest | null
    loc: LegalOfficerCase | null
    locItems: LocItem[]
    addMetadata: ((name: string, value: string) => void) | null
    publishMetadata: ((locItem: LocItem) => SignAndSubmit) | null
    removeMetadata: ((locItem: LocItem) => void) | null
    changeItemStatus: ((locItem: LocItem, status: LocItemStatus) => void) | null
}

function initialContextValue(locId: UUID): LocContext {
    return {
        locId,
        locRequest: null,
        loc: null,
        locItems: [],
        addMetadata: null,
        publishMetadata: null,
        removeMetadata: null,
        changeItemStatus: null,
    }
}

const LocContextObject: React.Context<LocContext> = React.createContext(initialContextValue(new UUID()))

type ActionType = 'SET_LOC_REQUEST'
    | 'SET_LOC'
    | 'SET_FUNCTIONS'
    | 'ADD_ITEM'
    | 'UPDATE_ITEM'
    | 'DELETE_ITEM'

interface Action {
    type: ActionType,
    locRequest?: LocRequest,
    loc?: LegalOfficerCase,
    locItem?: LocItem,
    status?: LocItemStatus,
    addMetadata?: (name: string, value: string) => void,
    publishMetadata?: (locItem: LocItem) => SignAndSubmit,
    removeMetadata?: (locItem: LocItem) => void,
    changeItemStatus?: ((locItem: LocItem, status: LocItemStatus) => void)
}

const reducer: Reducer<LocContext, Action> = (state: LocContext, action: Action): LocContext => {
    const items = state.locItems.concat();
    const itemIndex = items.indexOf(action.locItem!);
    switch (action.type) {
        case "SET_LOC_REQUEST":
            return { ...state, locRequest: action.locRequest! }
        case "SET_LOC":
            return { ...state, loc: action.loc! }
        case "SET_FUNCTIONS":
            return {
                ...state,
                addMetadata: action.addMetadata!,
                publishMetadata: action.publishMetadata!,
                removeMetadata: action.removeMetadata!,
                changeItemStatus: action.changeItemStatus!
            }
        case "ADD_ITEM":
            return { ...state, locItems: state.locItems.concat(action.locItem!) }
        case "UPDATE_ITEM":
            items[itemIndex] = { ...action.locItem!, status: action.status! }
            return { ...state, locItems: items }
        case "DELETE_ITEM":
            items.splice(itemIndex, 1)
            return { ...state, locItems: items }
        default:
            throw new Error(`Unknown type: ${ action.type }`);
    }
}

export interface Props {
    locId: UUID
    children: JSX.Element | JSX.Element[] | null
}

export function LocContextProvider(props: Props) {
    const { api } = useLogionChain();
    const { openedLocRequests } = useCommonContext();
    const [ contextValue, dispatch ] = useReducer(reducer, initialContextValue(props.locId));

    useEffect(() => {
        if (contextValue.locRequest === null && openedLocRequests !== null) {
            const locRequest = openedLocRequests.find(locRequest => locRequest.id === contextValue.locId.toString());
            if (locRequest !== undefined) {
                dispatch({ type: 'SET_LOC_REQUEST', locRequest })
            }
        }
    }, [ contextValue, openedLocRequests ])

    const addMetadataFunction = useCallback((name: string, value: string) => {
            const locItem: LocItem = {
                name,
                value,
                type: 'Data',
                timestamp: null,
                submitter: contextValue.loc!.owner,
                status: 'DRAFT'
            }
            dispatch({ type: 'ADD_ITEM', locItem: locItem })
        }, [ contextValue.loc ]
    )

    const publishMetadataFunction = useCallback((item: LocItem) => {
            const signAndSubmit: SignAndSubmit = (setResult, setError) => {
                const callback: SignAndSendCallback = (signedTransaction) => {
                    setResult(signedTransaction)
                };
                return addMetadata({
                    locId: contextValue.locId,
                    api: api!,
                    signerId: item.submitter,
                    item,
                    callback,
                    errorCallback: setError
                })
            };
            return signAndSubmit;
        }, [ api, contextValue.locId ]
    )

    const removeMetadataFunction = useCallback((locItem: LocItem) => {
            dispatch({ type: 'DELETE_ITEM', locItem })
        }, [ dispatch ]
    )

    const changeItemStatusFunction = useCallback((locItem: LocItem, status: LocItemStatus) => {
            dispatch({ type: 'UPDATE_ITEM', locItem, status })
        }, [ dispatch ]
    )

    useEffect(() => {
        if (contextValue.loc !== null && contextValue.addMetadata === null) {
            const addMetadata = addMetadataFunction
            const publishMetadata = publishMetadataFunction;
            const removeMetadata = removeMetadataFunction;
            const changeItemStatus = changeItemStatusFunction;
            dispatch({ type: 'SET_FUNCTIONS', addMetadata, publishMetadata, removeMetadata, changeItemStatus })
        }
    }, [ contextValue, addMetadataFunction, publishMetadataFunction, removeMetadataFunction, changeItemStatusFunction, dispatch ])

    useEffect(() => {
        if (contextValue.loc === null && api !== null) {
            getLegalOfficerCase({ locId: contextValue.locId, api })
                .then(loc => {
                    dispatch({ type: 'SET_LOC', loc })
                    loc!.metadata.forEach(item => {
                        const locItem: LocItem = {
                            name: item.name,
                            value: item.value,
                            submitter: loc!.owner,
                            timestamp: null,
                            type: 'Data',
                            status: 'PUBLISHED'
                        }
                        dispatch({ type: 'ADD_ITEM', locItem })
                    })
                })
        }
    }, [ contextValue.loc, api, contextValue.locId ])

    return (
        <LocContextObject.Provider value={ contextValue }>
            { props.children }
        </LocContextObject.Provider>
    )
}

export function useLocContext() {
    return useContext(LocContextObject)
}
