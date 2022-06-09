import React, { useContext, useReducer, Reducer, useEffect, useCallback, useState } from "react";
import { UUID } from "@logion/node-api/dist/UUID";
import { LocType } from "@logion/node-api/dist/Types";
import { useCommonContext } from "../common/CommonContext";
import { useLogionChain } from "../logion-chain";
import { LocItemStatus, LocItem } from "./types";
import {
    createDraftFileLocItem,
    createDraftMetadataLocItem,
    metadataToLocItem,
    fileToLocItem,
    linkToLocItem
} from "./LocItemFactory";
import { fullCertificateUrl } from "../PublicPaths";
import {
    OpenLoc,
    ClosedLoc,
    VoidedLoc,
    ClosedCollectionLoc,
    LocData,
    MergedMetadataItem,
    MergedFile,
    MergedLink
} from "@logion/client/dist/Loc";
import { useUserContext } from "../wallet-user/UserContext";

export type ActiveLoc = OpenLoc | ClosedLoc | ClosedCollectionLoc | VoidedLoc;

export interface UserLocContext {
    locId: UUID
    loc: LocData | null
    locState: ActiveLoc | null
    locItems: LocItem[]
    addMetadata: ((name: string, value: string) => void) | null
    addFile: ((name: string, file: File, nature: string) => Promise<void>) | null
    deleteFile: ((locItem: LocItem) => void) | null
    deleteMetadata: ((locItem: LocItem) => void) | null
    backPath: string
    detailsPath: (locId: UUID, type: LocType) => string
    refresh: () => void
    requestSof: (() => void) | null
    requestSofOnCollection: ((collectionItemId: string) => void) | null
}

const MAX_REFRESH = 20;
const REFRESH_INTERVAL = 5000;

function initialContextValue(locId: UUID, backPath: string, detailsPath: (locId: UUID, type: LocType) => string): UserLocContext {
    return {
        locId,
        backPath,
        detailsPath,
        loc: null,
        locState: null,
        locItems: [],
        addMetadata: null,
        addFile: null,
        deleteFile: null,
        deleteMetadata: null,
        refresh: () => {
        },
        requestSof: null,
        requestSofOnCollection: null,
    }
}

const UserLocContextObject: React.Context<UserLocContext> = React.createContext(initialContextValue(new UUID(), "", () => ""))

type ActionType = 'SET_LOC'
    | 'SET_FUNCTIONS'
    | 'ADD_ITEM'
    | 'UPDATE_ITEM_STATUS'
    | 'UPDATE_ITEM_TIMESTAMP'
    | 'DELETE_ITEM'
    | 'RESET'

interface Action {
    type: ActionType,
    locId?: UUID,
    locState?: ActiveLoc,
    locItem?: LocItem,
    status?: LocItemStatus,
    name?: string,
    timestamp?: string,
    addMetadata?: (name: string, value: string) => void,
    addFile?: (name: string, file: File, nature: string) => Promise<void>,
    deleteFile?: (locItem: LocItem) => void,
    deleteMetadata?: (locItem: LocItem) => void,
    refresh?: () => void,
    requestSof?: () => void,
    requestSofOnCollection?: (collectionItemId: string) => void,
}

const reducer: Reducer<UserLocContext, Action> = (state: UserLocContext, action: Action): UserLocContext => {
    const items = state.locItems.concat();
    const itemIndex = items.indexOf(action.locItem!);
    switch (action.type) {
        case "RESET":
            return initialContextValue(action.locId!, state.backPath, state.detailsPath)
        case "SET_LOC":
            return { ...state, loc: action.locState!.data(), locState: action.locState! }
        case "SET_FUNCTIONS":
            return {
                ...state,
                addMetadata: action.addMetadata!,
                addFile: action.addFile!,
                deleteFile: action.deleteFile!,
                deleteMetadata: action.deleteMetadata!,
                refresh: action.refresh!,
                requestSof: action.requestSof!,
                requestSofOnCollection: action.requestSofOnCollection!,
            }
        case "ADD_ITEM":
            if (itemExists(action.locItem!, state.locItems)) {
                return { ...state }
            } else {
                return { ...state, locItems: state.locItems.concat(action.locItem!) }
            }
        case "UPDATE_ITEM_STATUS":
            items[itemIndex] = { ...action.locItem!, status: action.status!, newItem: false }
            return { ...state, locItems: items }
        case "UPDATE_ITEM_TIMESTAMP":
            items[itemIndex] = { ...action.locItem!, timestamp: action.timestamp!, newItem: false }
            return { ...state, locItems: items }
        case "DELETE_ITEM":
            items.splice(itemIndex, 1)
            return { ...state, locItems: items }
        default:
            throw new Error(`Unknown type: ${ action.type }`);
    }
}

function itemExists(locItem: LocItem, locItems: LocItem[]): boolean {
    return locItems.find(item =>
        item.type === locItem.type &&
        item.name === locItem.name &&
        item.value === locItem.value) !== undefined;
}

export interface Props {
    locId: UUID
    children: JSX.Element | JSX.Element[] | null
    backPath: string
    detailsPath: (locId: UUID, type: LocType) => string
}

const enum NextRefresh {
    STOP,
    SCHEDULE,
    IMMEDIATE
}

export function UserLocContextProvider(props: Props) {

    const { accounts, client } = useLogionChain();
    const { refresh } = useCommonContext();
    const { refreshRequests } = useUserContext();
    const [ contextValue, dispatch ] = useReducer(reducer, initialContextValue(props.locId, props.backPath, props.detailsPath));
    const [ refreshing, setRefreshing ] = useState<boolean>(false);
    const [ refreshCounter, setRefreshCounter ] = useState<number>(0);

    useEffect(() => {
        if (props.locId.toString() !== contextValue.locId.toString()) {
            dispatch({ type: 'RESET', locId: props.locId })
        }
    }, [ contextValue.locId, props.locId ])

    useEffect(() => {
        if (client !== null && contextValue.locState === null) {
            (async function () {
                const locsState = await client.locsState();
                const locState = await locsState.findById({ locId: contextValue.locId }) as ActiveLoc;
                const loc = locState?.data();
                if (loc) {
                    const locOwner = loc!.ownerAddress;
                    dispatch({ type: 'SET_LOC', locState });
                    let refreshNeeded = false;
                    loc.metadata.forEach(item => {
                        const result = metadataToLocItem(item)
                        dispatch({ type: 'ADD_ITEM', locItem: result.locItem })
                        if (result.refreshNeeded) {
                            refreshNeeded = true;
                        }
                    })
                    loc.files.forEach(item => {
                        const result = fileToLocItem(item);
                        dispatch({ type: 'ADD_ITEM', locItem: result.locItem })
                        if (result.refreshNeeded) {
                            refreshNeeded = true;
                        }
                    })
                    for (let i = 0; i < loc.links.length; ++i) {
                        const item = loc.links[i];

                        const linkedLocState = await locsState.findById({ locId: item.id });
                        const linkedLoc = linkedLocState?.data();

                        if (linkedLoc) {
                            let linkDetailsPath: string;
                            if (isGrantedAccess(accounts?.current?.address, linkedLoc)) {
                                linkDetailsPath = contextValue.detailsPath(linkedLoc.id, linkedLoc.locType);
                            } else {
                                linkDetailsPath = fullCertificateUrl(linkedLoc.id);
                            }
                            const result = linkToLocItem(
                                item,
                                linkedLoc.description || "- Confidential -",
                                locOwner,
                                linkDetailsPath,
                            )
                            dispatch({ type: 'ADD_ITEM', locItem: result.locItem })
                            if (result.refreshNeeded) {
                                refreshNeeded = true;
                            }
                        }
                    }
                    if (refreshNeeded) {
                        setRefreshCounter(MAX_REFRESH);
                    }
                }
            })();
        }
    }, [ contextValue, contextValue.locId, accounts, client ])

    const refreshNameTimestamp = useCallback<() => Promise<NextRefresh>>(() => {

        function refreshTimestamps(locState: ActiveLoc): boolean {
            const loc = locState.data();
            let refreshed = false;
            contextValue.locItems
                .filter(currentItem => currentItem.timestamp === null)
                .forEach(currentItem => {
                    const refreshedItem = findItemInLocRequest(loc, currentItem)
                    if (refreshedItem && refreshedItem.addedOn) {
                        refreshed = true;
                        dispatch({
                            type: 'UPDATE_ITEM_TIMESTAMP',
                            locItem: currentItem,
                            timestamp: refreshedItem.addedOn
                        })
                    }
                })
            return refreshed;
        }

        function refreshRequestDates(locState: ActiveLoc): boolean {
            const loc = locState.data();
            let refreshed = false;
            if (contextValue.loc?.closedOn === undefined && loc.closedOn) {
                refreshed = true;
            }
            if (contextValue.loc?.voidInfo?.voidedOn === undefined && loc.voidInfo?.voidedOn) {
                refreshed = true;
            }
            if (refreshed) {
                dispatch({ type: 'SET_LOC', locState });
            }
            return refreshed;
        }

        if (contextValue.loc === null) {
            return Promise.resolve(NextRefresh.SCHEDULE);
        }

        if (allItemsOK(contextValue.locItems) && requestOK(contextValue.locState!)) {
            refresh!(false);
            refreshRequests!(false);
            return Promise.resolve(NextRefresh.STOP);
        }

        const proceed = async () => {
            let nextRefresh = NextRefresh.SCHEDULE;
            const locRequest = await contextValue.locState!.refresh();
            if (refreshTimestamps(locRequest)) {
                nextRefresh = NextRefresh.IMMEDIATE;
            }
            if (refreshRequestDates(locRequest)) {
                nextRefresh = NextRefresh.IMMEDIATE;
            }
            return nextRefresh;
        }
        return proceed()
    }, [ contextValue.loc, contextValue.locItems, contextValue.locState, refresh, refreshRequests ])

    useEffect(() => {
        if (refreshCounter > 0 && !refreshing) {
            (async function () {
                setRefreshing(true)
                const nextRefresh = await refreshNameTimestamp();
                switch (nextRefresh) {
                    case NextRefresh.STOP:
                        setRefreshCounter(0);
                        setRefreshing(false)
                        break;
                    case NextRefresh.SCHEDULE:
                        setRefreshCounter(refreshCounter - 1)
                        setTimeout(() => setRefreshing(false), REFRESH_INTERVAL, null)
                        break;
                    case NextRefresh.IMMEDIATE:
                        setRefreshCounter(refreshCounter - 1)
                        setRefreshing(false)
                        break;
                }
            })()
        }
    }, [ refreshNameTimestamp, refreshCounter, setRefreshCounter, refreshing, setRefreshing ])


    const addLocItemFunction = useCallback((locItemCreator: () => LocItem) => {
        const locItem = locItemCreator();
        dispatch({ type: 'ADD_ITEM', locItem })
        setRefreshCounter(MAX_REFRESH)
    }, [ setRefreshCounter ])


    const deleteFileFunction = useCallback((item: LocItem) => {
            (contextValue.locState as OpenLoc).deleteFile({ hash: item.value })
                .then(() => dispatch({ type: 'DELETE_ITEM', locItem: item }));
        }, [ contextValue.locState ]
    )

    const deleteMetadataFunction = useCallback((item: LocItem) => {
            (contextValue.locState as OpenLoc).deleteMetadata({ name: item.name })
                .then(() => dispatch({ type: 'DELETE_ITEM', locItem: item }));
        }, [ contextValue.locState ]
    )

    const addMetadataFunction = useCallback(async (name: string, value: string) => {
        const submitter = accounts!.current!.address;
        await (contextValue.locState as OpenLoc).addMetadata({
            name,
            value,
        })
        addLocItemFunction(() => createDraftMetadataLocItem(
            {
                metadataItem: { name, value, submitter },
            }, true))
    }, [ accounts, addLocItemFunction, contextValue.locState ])

    const addFileFunction = useCallback(async (name: string, file: File, nature: string) => {
        const submitter = accounts!.current!.address;
        const { hash } = await (contextValue.locState as OpenLoc).addFile({
            file,
            fileName: name,
            nature
        })
        addLocItemFunction(
            () => createDraftFileLocItem({
                file: {
                    hash,
                    nature,
                    submitter
                },
                name
            }, true))
    }, [ accounts, addLocItemFunction, contextValue.locState ])

    const refreshFunction = useCallback(() => {
        dispatch({ type: 'RESET', locId: contextValue.locId });
    }, [ dispatch, contextValue ]);

    const requestSofFunction = useCallback(async () => {
        const loc = contextValue.locState;
        if (loc instanceof OpenLoc || loc instanceof ClosedLoc) {
            await loc.requestSof()
        } else {
            throw Error("Can only request SOF on Open or Closed LOC.")
        }
    }, [ contextValue.locState ])

    const requestSofOnCollectionFunction = useCallback(async (itemId: string) => {
        const loc = contextValue.locState;
        if (loc instanceof ClosedCollectionLoc) {
            await loc.requestSof({ itemId })
        } else {
            throw Error("Can only request SOF on Closed Collection LOC.")
        }
    }, [ contextValue.locState ])

    useEffect(() => {
        if (contextValue.loc && contextValue.loc.ownerAddress !== null && contextValue.addMetadata === null) {
            const action: Action = {
                type: 'SET_FUNCTIONS',
                addMetadata: addMetadataFunction,
                addFile: addFileFunction,
                deleteFile: deleteFileFunction,
                deleteMetadata: deleteMetadataFunction,
                refresh: refreshFunction,
                requestSof: requestSofFunction,
                requestSofOnCollection: requestSofOnCollectionFunction,
            };
            dispatch(action)
        }
    }, [ contextValue.loc, contextValue.addMetadata, addLocItemFunction, deleteFileFunction,
        deleteMetadataFunction, dispatch, addMetadataFunction, addFileFunction, refreshFunction, requestSofFunction,
        requestSofOnCollectionFunction ])

    return (
        <UserLocContextObject.Provider value={ contextValue }>
            { props.children }
        </UserLocContextObject.Provider>
    )
}

export function useUserLocContext() {
    return useContext(UserLocContextObject)
}

function findItemInLocRequest(locRequest: LocData, item: LocItem): MergedMetadataItem | MergedFile | MergedLink | undefined {
    if (item.type === 'Document') {
        return locRequest.files.find(file => file.hash === item.value)
    }
    if (item.type === 'Linked LOC') {
        return locRequest.links.find(link => UUID.fromAnyString(link.target)!.toString() === item.target!.toString())
    } else {
        return locRequest.metadata.find(metadata => metadata.name === item.name)
    }
}

function allItemsOK(items: LocItem[]): boolean {
    return items.find(item => item.status === "PUBLISHED" && item.timestamp === null) === undefined;
}

function requestOK(locRequest: ActiveLoc): boolean {
    return (!(locRequest instanceof ClosedLoc) || locRequest.data().closedOn !== undefined)
        && (!(locRequest instanceof VoidedLoc) || locRequest.data().voidInfo!.voidedOn !== undefined);
}

function isGrantedAccess(address: string | undefined, loc: LocData): boolean {
    return loc.ownerAddress === address || loc.requesterAddress === address;
}
