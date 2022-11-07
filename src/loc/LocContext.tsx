import React, { useContext, useReducer, Reducer, useEffect, useCallback, useState } from "react";
import {
    UUID,
    LocType,
} from "@logion/node-api";
import {
    LocRequestState,
    ClosedCollectionLoc,
    LocData,
    PublicLoc,
    CollectionItem,
    FetchAllLocsParams,
    DraftRequest,
    LocsState,
} from "@logion/client";
import {
    isGrantedAccess,
} from "../common/Model";
import { useLogionChain } from "../logion-chain";
import { LocItemStatus, LocItem } from "./types";
import {
    createFileItem,
    createMetadataItem,
    createLinkItem
} from "./LocItemFactory";
import { fullCertificateUrl } from "../PublicPaths";
import { DocumentCheckResult } from "src/components/checkfileframe/CheckFileFrame";

export interface LocContext {
    loc: LocData | null
    supersededLoc?: PublicLoc
    locState: LocRequestState | null
    locItems: LocItem[]
    backPath: string
    detailsPath: (locId: UUID, type: LocType) => string
    refresh: () => Promise<void>
    checkHash: (hash: string) => void
    checkResult: DocumentCheckResult
    collectionItem?: CollectionItem
    collectionItems: CollectionItem[]
    mutateLocState: (mutator: (current: LocRequestState) => Promise<LocRequestState | LocsState>) => Promise<void>
}

export interface PrivateLocContext extends LocContext {
    mustFetchCollectionItems: boolean;
}

const MAX_REFRESH = 20;
const REFRESH_INTERVAL = 5000;

function initialContextValue(locState: LocRequestState | null, backPath: string, detailsPath: (locId: UUID, type: LocType) => string): PrivateLocContext {
    return {
        locState,
        loc: locState ? locState.data() : null,
        backPath,
        detailsPath,
        locItems: [],
        refresh: () => Promise.reject(new Error("undefined")),
        checkHash: () => {},
        checkResult: { result: "NONE" },
        collectionItems: [],
        mutateLocState: () => Promise.reject(),
        mustFetchCollectionItems: locState instanceof ClosedCollectionLoc,
    }
}

const LocContextObject: React.Context<PrivateLocContext> = React.createContext(initialContextValue(null, "", () => ""))

type ActionType = 'SET_LOC_REQUEST'
    | 'SET_LOC'
    | 'VOID'
    | 'RESET'
    | 'SET_CHECK_RESULT'
    | 'SET_DELETE_LINK'
    | 'SET_DELETE_METADATA'
    | 'SET_REFRESH'
    | 'SET_CHECK_HASH'
    | 'SET_MUTATE_LOC_STATE'
;

interface Action {
    type: ActionType,
    locId?: UUID,
    supersededLoc?: PublicLoc,
    locItem?: LocItem,
    locItems?: LocItem[],
    status?: LocItemStatus,
    name?: string,
    timestamp?: string,
    refresh?: () => Promise<void>,
    locState?: LocRequestState,
    locData?: LocData,
    checkHash?: (hash: string) => void,
    collectionItem?: CollectionItem,
    checkResult?: DocumentCheckResult,
    requestSof?: () => Promise<void>,
    requestSofOnCollection?: (collectionItemId: string) => Promise<void>,
    collectionItems?: CollectionItem[],
    mutateLocState?: (mutator: (current: LocRequestState) => Promise<LocRequestState | LocsState>) => Promise<void>,
}

const reducer: Reducer<PrivateLocContext, Action> = (state: PrivateLocContext, action: Action): PrivateLocContext => {
    switch (action.type) {
        case "RESET":
            return initialContextValue(action.locState!, state.backPath, state.detailsPath)
        case "SET_LOC":
            return {
                ...state,
                supersededLoc: action.supersededLoc,
                locState: action.locState!,
                loc: action.locData!,
                locItems: action.locItems!,
                collectionItems: action.collectionItems!,
                mustFetchCollectionItems: false,
            }
        case "SET_CHECK_RESULT":
            return {
                ...state,
                checkResult: action.checkResult!,
                collectionItem: action.collectionItem,
            }
        case 'SET_REFRESH':
            return {
                ...state,
                refresh: action.refresh!,
            }
        case 'SET_CHECK_HASH':
            return {
                ...state,
                checkHash: action.checkHash!,
            }
        case 'SET_MUTATE_LOC_STATE':
            return {
                ...state,
                mutateLocState: action.mutateLocState!,
            }
        default:
            throw new Error(`Unknown type: ${ action.type }`);
    }
}

export interface Props {
    locState: LocRequestState
    children: JSX.Element | JSX.Element[] | null
    backPath: string
    detailsPath: (locId: UUID, type: LocType) => string
    refreshLocs: (newLocsState: LocsState) => Promise<void>
    fetchAllLocsParams?: FetchAllLocsParams
}

const enum NextRefresh {
    STOP,
    SCHEDULE
}

export function LocContextProvider(props: Props) {
    const { accounts, client } = useLogionChain();
    const [ contextValue, dispatch ] = useReducer(reducer, initialContextValue(props.locState, props.backPath, props.detailsPath));
    const [ refreshing, setRefreshing ] = useState<boolean>(false);
    const [ refreshCounter, setRefreshCounter ] = useState<number>(0);

    useEffect(() => {
        if (props.locState !== contextValue.locState) {
            dispatch({ type: 'RESET', locState: props.locState });
        }
    }, [ contextValue.locState, props.locState ])

    const toLocItems = useCallback((locState: LocRequestState) => {
        const loc = locState.data();
        let locItems: LocItem[] = [];
        loc.metadata.forEach(item => {
            const result = createMetadataItem(item);
            locItems.push(result.locItem);
        });
        loc.files.forEach(item => {
            const result = createFileItem(item);
            locItems.push(result.locItem);
        });
        const locOwner = loc!.ownerAddress;
        for (let i = 0; i < loc.links.length; ++i) {
            const item = loc.links[i];

            const linkedLocState = locState.locsState().findById(item.id);
            const linkedLoc = linkedLocState?.data();

            if (linkedLoc) {
                let linkDetailsPath: string;
                if (isGrantedAccess(accounts?.current?.address, linkedLoc)) {
                    linkDetailsPath = props.detailsPath(linkedLoc.id, linkedLoc.locType);
                } else {
                    linkDetailsPath = fullCertificateUrl(linkedLoc.id);
                }
                const result = createLinkItem({
                    link: item,
                    otherLocDescription: linkedLoc.description || "- Confidential -",
                    submitter: locOwner,
                    linkDetailsPath,
                })
                locItems.push(result.locItem)
            }
        }
        return locItems;
    }, [ accounts, props ])

    const startRefresh = useCallback(() => {
        console.log("Start refreshing LOC");
        setRefreshCounter(MAX_REFRESH);
    }, []);

    const dispatchLocAndItems = useCallback(async (locState: LocRequestState, triggerRefresh: boolean) => {
        const locItems = toLocItems(locState);
        const locData = locState.data();
        let supersededLoc = undefined;
        if(locData.replacerOf) {
            if(contextValue.supersededLoc && contextValue.supersededLoc.data.id.toString() === locData.replacerOf.toString()) {
                supersededLoc = contextValue.supersededLoc;
            } else {
                supersededLoc = await client!.public.findLocById({ locId: locData.replacerOf });
            }
        }
        let collectionItems: CollectionItem[] = [];
        if(locState instanceof ClosedCollectionLoc) {
            collectionItems = await locState.getCollectionItems();
        }
        dispatch({
            type: 'SET_LOC',
            locState,
            locItems,
            supersededLoc,
            locData,
            collectionItems,
        });
        if (triggerRefresh && refreshNeeded(locItems) && !(locState instanceof DraftRequest)) {
            startRefresh();
        }
        await props.refreshLocs(locState.locsState());
    }, [ toLocItems, client, contextValue.supersededLoc, props, startRefresh ]);

    useEffect(() => {
        if(contextValue.locState && !contextValue.locState.discarded
            && mustDispatchNewState(contextValue.locState, contextValue.locItems, contextValue.mustFetchCollectionItems)) {

            dispatchLocAndItems(contextValue.locState, true);
        }
    }, [ contextValue.locState, contextValue.locItems, contextValue.mustFetchCollectionItems, dispatchLocAndItems ]);

    const refreshLocState = useCallback(async (triggerRefresh: boolean): Promise<LocRequestState | null> => {
        if(contextValue.locState
                && !contextValue.locState.discarded
                && !contextValue.locState.locsState().discarded) {
            const locState = await contextValue.locState.refresh();
            await dispatchLocAndItems(locState, triggerRefresh);
            return locState;
        } else {
            return contextValue.locState;
        }
    }, [ contextValue.locState, dispatchLocAndItems ]);

    const refreshNameTimestamp = useCallback<() => Promise<NextRefresh>>(async () => {
        if (contextValue.loc === null || contextValue.locState === null || contextValue.locState.discarded) {
            return NextRefresh.SCHEDULE;
        }

        if (allItemsOK(contextValue.locItems) && requestOK(contextValue.loc)) {
            props.refreshLocs(contextValue.locState.locsState());
            return NextRefresh.STOP;
        } else {
            return NextRefresh.SCHEDULE;
        }
    }, [
        contextValue.loc,
        contextValue.locItems,
        contextValue.locState,
        props,
    ])

    useEffect(() => {
        if (refreshCounter > 0 && !refreshing) {
            (async function () {
                setRefreshing(true)
                const nextRefresh = await refreshNameTimestamp();
                switch (nextRefresh) {
                    case NextRefresh.STOP:
                        console.log("Stop refreshing.");
                        setRefreshCounter(0);
                        setRefreshing(false)
                        break;
                    case NextRefresh.SCHEDULE:
                        console.log("Scheduling next refresh...");
                        setRefreshCounter(refreshCounter - 1);
                        setTimeout(() => { setRefreshing(false); refreshLocState(false); }, REFRESH_INTERVAL, null)
                        break;
                    default:
                        throw new Error(`Unsupported next refresh ${ nextRefresh }`);
                }
            })()
        }
    }, [ refreshNameTimestamp, refreshCounter, setRefreshCounter, refreshing, setRefreshing, refreshLocState ])

    const refreshFunction = useCallback(async () => {
        await refreshLocState(true);
    }, [ refreshLocState ]);

    useEffect(() => {
        if(contextValue.refresh !== refreshFunction) {
            dispatch({
                type: "SET_REFRESH",
                refresh: refreshFunction,
            })
        }
    }, [ contextValue.refresh, refreshFunction ]);

    const checkHashFunction = useCallback(async (hash: string) => {
        const result = await contextValue.locState?.checkHash(hash);

        if (result?.collectionItem || result?.file || result?.metadataItem) {
            dispatch({
                type: "SET_CHECK_RESULT",
                checkResult: {
                    result: "POSITIVE",
                    hash,
                },
                collectionItem: result?.collectionItem,
            });
        } else {
            dispatch({
                type: "SET_CHECK_RESULT",
                checkResult: {
                    result: "NEGATIVE",
                    hash,
                },
                collectionItem: undefined,
            });
        }
    }, [ contextValue.locState ]);

    useEffect(() => {
        if(contextValue.checkHash !== checkHashFunction) {
            dispatch({
                type: "SET_CHECK_HASH",
                checkHash: checkHashFunction,
            })
        }
    }, [ contextValue.checkHash, checkHashFunction ]);

    const mutateLocStateCallback = useCallback(async (mutator: (current: LocRequestState) => Promise<LocRequestState | LocsState>): Promise<void> => {
        const result = await mutator(contextValue.locState!);
        if((result instanceof LocRequestState) && result !== contextValue.locState) {
            dispatchLocAndItems(result, true);
        } else if(result instanceof LocsState) {
            props.refreshLocs(result);
        }
    }, [ contextValue.locState, dispatchLocAndItems, props ]);

    useEffect(() => {
        if (contextValue.mutateLocState !== mutateLocStateCallback) {
            dispatch({
                type: "SET_MUTATE_LOC_STATE",
                mutateLocState: mutateLocStateCallback,
            });
        }
    }, [ mutateLocStateCallback, contextValue.mutateLocState ]);

    return (
        <LocContextObject.Provider value={ contextValue }>
            { props.children }
        </LocContextObject.Provider>
    )
}

export function useLocContext() {
    return useContext(LocContextObject)
}

function allItemsOK(items: LocItem[]): boolean {
    return items.find(item => item.status === "PUBLISHED" && item.timestamp === null) === undefined;
}

function requestOK(locRequest: LocData): boolean {
    return (locRequest.status !== "CLOSED" || locRequest.closedOn !== undefined)
        && (locRequest.voidInfo === undefined || locRequest.voidInfo.voidedOn !== undefined);
}

function refreshNeeded(items: LocItem[]): boolean {
    for(const item of items) {
        if(!item.timestamp && item.status === "PUBLISHED") {
            return true;
        }
    }
    return false;
}

function mustDispatchNewState(locState: LocRequestState, locItems: LocItem[], mustFetchCollectionItems: boolean): boolean {
    const locData = locState.data();
    return mustFetchCollectionItems || (locData.files.length + locData.metadata.length + locData.links.length) !== locItems.length;
}
