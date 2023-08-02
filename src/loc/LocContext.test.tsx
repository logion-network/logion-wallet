import { AxiosInstance } from "axios";
import { useCallback, useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { UUID, LegalOfficerCase, Hash } from '@logion/node-api';
import { LocData } from "@logion/client";
import { LogionClient } from '@logion/client/dist/LogionClient.js';
import { PublicApi, EditableRequest as RealEditableRequest, LocRequestState as RealLocRequestState } from "@logion/client";

import { resetDefaultMocks } from "../common/__mocks__/ModelMock";
import { clickByName } from "../tests";
import { LocContextProvider, useLocContext } from "./LocContext"
import { buildLocRequest } from "./TestData";
import { setClientMock } from "src/logion-chain/__mocks__/LogionChainMock";
import { LocRequestState, EditableRequest, OpenLoc, ClosedLoc } from "src/__mocks__/LogionClientMock";
import { useLogionChain } from "src/logion-chain";
import ClientExtrinsicSubmitter, { Call } from "src/ClientExtrinsicSubmitter";
import { mockValidPolkadotAccountId, api, CLOSED_IDENTITY_LOC, CLOSED_IDENTITY_LOC_ID, OPEN_IDENTITY_LOC, OPEN_IDENTITY_LOC_ID } from 'src/__mocks__/LogionMock';

jest.mock("../logion-chain/Signature");
jest.mock("../logion-chain");
jest.mock("../common/CommonContext");
jest.mock("../common/Model");

describe("LocContext", () => {

    it("fetches LOC data", async () => {
        givenRequest(CLOSED_IDENTITY_LOC_ID, CLOSED_IDENTITY_LOC, ClosedLoc);
        whenRenderingInContext(_locState, <Reader/>);
        await thenReaderDisplaysLocRequestAndItems();
    })

    it("adds items", async () => {
        givenRequest(OPEN_IDENTITY_LOC_ID, OPEN_IDENTITY_LOC, OpenLoc, CLOSED_IDENTITY_LOC_ID, CLOSED_IDENTITY_LOC);
        whenRenderingInContext(_locState, <ItemAdder/>);
        await waitFor(() => screen.getByText("Ready"));
        await clickByName("Go");
        await thenItemsAdded();
    })

    it("deletes items", async () => {
        givenRequest(OPEN_IDENTITY_LOC_ID, OPEN_IDENTITY_LOC, OpenLoc, CLOSED_IDENTITY_LOC_ID, CLOSED_IDENTITY_LOC);
        givenDraftItems();
        resetDefaultMocks();
        whenRenderingInContext(_locState, <ItemDeleter />);
        await waitFor(() => expect(screen.getByRole("button", {name: "Go"})).not.toBeDisabled());
        await clickByName("Go");
        await thenItemsDeleted();
    })

    it("voids", async () => {
        givenRequest(OPEN_IDENTITY_LOC_ID, OPEN_IDENTITY_LOC, OpenLoc);
        resetDefaultMocks();
        whenRenderingInContext(_locState, <Voider/>);
        await clickByName("Go");
        await waitFor(() => expect(screen.getByText("Submitting...")).toBeVisible());
        await thenVoided();
    })
})

function givenRequest<T extends LocRequestState>(locId: string, loc: LegalOfficerCase, locStateConstructor: new () => T, linkedLocId?: string, linkedLoc?: LegalOfficerCase) {
    const locsState: any = {};

    _locData = buildLocRequest(UUID.fromDecimalString(locId)!, loc);
    _locState = new locStateConstructor();
    _locState.data = () => _locData;
    _locState.locsState = () => locsState;
    _locState.refresh = () => Promise.resolve(_locState);
    if(_locState instanceof EditableRequest) {
        _locState.addMetadata = jest.fn().mockResolvedValue(_locState);
        _locState.deleteMetadata = jest.fn().mockResolvedValue(_locState);
        _locState.addFile = jest.fn().mockResolvedValue(_locState);
        _locState.deleteFile = jest.fn().mockResolvedValue( _locState);
    }

    if(linkedLocId && linkedLoc) {
        _linkedLocData = buildLocRequest(UUID.fromDecimalString(linkedLocId)!, linkedLoc);
        _linkedLocState = {
            data: () => _linkedLocData,
            locsState: () => locsState,
            refresh: () => Promise.resolve(_linkedLocData),
        } as unknown as OpenLoc;
    }

    locsState.findByIdOrUndefined = (argLocId: UUID) => {
        if (argLocId.toDecimalString() === locId) {
            return _locState;
        } else if (linkedLocId && linkedLoc && argLocId.toDecimalString() === linkedLocId) {
            return _linkedLocState;
        } else {
            return undefined;
        }
    }

    locsState.findById = (argLocId: UUID) => {
        const loc = locsState.findByIdOrUndefined(argLocId);
        if(!loc) {
            throw new Error();
        }
    }

    const publicMock = {
        findLocById: (arg: { locId: UUID }) => {
            if (arg.locId.toDecimalString() === locId) {
                return Promise.resolve({
                    data: _locData
                });
            } else if (linkedLocId && linkedLoc && arg.locId.toDecimalString() === linkedLocId) {
                return Promise.resolve({
                    data: _linkedLocData
                });
            } else {
                return Promise.reject(new Error());
            }
        }
    } as unknown as PublicApi;

    axiosMock = {
        post: jest.fn().mockResolvedValue(undefined),
        put: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(undefined),
    } as unknown as AxiosInstance;
    const client = {
        locsState: () => Promise.resolve(locsState),
        public: publicMock,
        getLegalOfficer: () => ({ buildAxiosToNode: () => axiosMock }),
        logionApi: api.object(),
    } as unknown as LogionClient;
    locsState.client = client;
    setClientMock(client);
}

let _locData: LocData;
let _locState: LocRequestState;
let _linkedLocData: LocData;
let _linkedLocState: LocRequestState;
let axiosMock: AxiosInstance;

function whenRenderingInContext(locState: LocRequestState, element: JSX.Element) {
    render(
        <LocContextProvider
            locState={ locState as unknown as RealLocRequestState }
            backPath="/"
            detailsPath={() => ""}
            refreshLocs={() => Promise.resolve()}
        >
            { element }
        </LocContextProvider>
    );
}

function Reader() {
    const { loc: locData, locItems } = useLocContext();

    if(!locData) {
        return null;
    }

    return (
        <div>
            <p>{ locData.id.toString() }</p>
            <p>{ locData.ownerAddress }</p>
            <ul>
                {
                    locItems.map((item, index) => <li key={ index }>
                        <p>{ item.name }</p>
                    </li>)
                }
            </ul>
        </div>
    );
}

async function thenReaderDisplaysLocRequestAndItems() {
    await waitFor(() => expect(screen.getByText(UUID.fromDecimalString(CLOSED_IDENTITY_LOC_ID)!.toString())).toBeVisible());
    expect(screen.getByText(CLOSED_IDENTITY_LOC.owner)).toBeVisible();
    for(let i = 0; i < CLOSED_IDENTITY_LOC.files.length; ++i) {
        await waitFor(() => expect(screen.getByText(`File ${i}`)).toBeVisible());
    }
    for(let i = 0; i < CLOSED_IDENTITY_LOC.metadata.length; ++i) {
        await waitFor(() => expect(screen.getByText(`Data ${i}`)).toBeVisible());
    }
    for(let i = 0; i < CLOSED_IDENTITY_LOC.links.length; ++i) {
        await waitFor(() => expect(screen.getByText(`Link ${i}`)).toBeVisible());
    }
}

function ItemAdder() {
    const { locItems, locState, mutateLocState } = useLocContext();

    const callback = useCallback(async () => {
        await mutateLocState(async current => {
            if(current instanceof EditableRequest) {
                let next: RealEditableRequest;
                next = await current.addMetadata!({
                    name: "New data",
                    value: "value"
                }) as unknown as RealEditableRequest;
                next = await current.addFile!({
                    file: new File([], "file.png"),
                    name: "New file",
                    nature: "Some nature",
                }) as unknown as RealEditableRequest;
                next = await current.legalOfficer.addLink({
                    target: _linkedLocData.id,
                    nature: "Some nature"
                }) as unknown as RealEditableRequest;
                return next as unknown as RealLocRequestState;
            } else {
                return current as unknown as RealLocRequestState;
            }
        });
    }, [ mutateLocState ]);

    if(!locState) {
        return null;
    }

    return (
        <div>
            <p>Ready</p>
            <button onClick={ callback }>Go</button>
            <ul>
                {
                    locItems.map((item, index) => <li key={ index }>
                        <p>{ item.name }</p>
                    </li>)
                }
            </ul>
        </div>
    );
}

async function thenItemsAdded() {
    await waitFor(() => expect((_locState as OpenLoc).addMetadata).toBeCalled());
    expect((_locState as OpenLoc).addFile).toBeCalled();
    expect((_locState as OpenLoc).legalOfficer.addLink).toBeCalled();
}

function givenDraftItems() {
    const metadataName = "New data";
    _locData.metadata.push({
        addedOn: "",
        name: metadataName,
        nameHash: Hash.of(metadataName),
        submitter: mockValidPolkadotAccountId(OPEN_IDENTITY_LOC.owner),
        value: "Some value",
        published: false,
        status: "DRAFT",
    })
    _locData.files.push({
        hash: Hash.of("new-hash"),
        addedOn: "",
        name: "New file",
        submitter: mockValidPolkadotAccountId(OPEN_IDENTITY_LOC.owner),
        nature: "Some nature",
        published: false,
        restrictedDelivery: false,
        contentType: "text/plain",
        size: 42n,
        status: "DRAFT",
    })
    _locData.links.push({
        addedOn: "",
        nature: "New link",
        target: _linkedLocData.id.toString(),
        published: false,
    })
}

function ItemDeleter() {
    const { locItems, mutateLocState } = useLocContext();

    const callback = useCallback(async () => {
        await mutateLocState(async current => {
            if(current instanceof EditableRequest) {
                let next: RealEditableRequest;
                next = current.deleteFile!({
                    hash: Hash.of("new-hash"),
                }) as unknown as RealEditableRequest;
                next = current.legalOfficer.deleteLink!({
                    locState: current as unknown as RealEditableRequest,
                    target: locItems.find(item => item.nature === "New link")!.target!,
                }) as unknown as RealEditableRequest;
                next = current.deleteMetadata!({
                    nameHash: Hash.of("New data"),
                }) as unknown as RealEditableRequest;
                return next;
            } else {
                return current;
            }
        });
    }, [ locItems, mutateLocState ]);

    return (
        <div>
            <button onClick={ callback } disabled={ locItems.length < 3 }>Go</button>
            <ul>
                {
                    locItems.filter(item => item.status === "DRAFT").map((item, index) => <li key={ index }>
                        <p>{ item.name }</p>
                    </li>)
                }
            </ul>
        </div>
    );
}

async function thenItemsDeleted() {
    await waitFor(() => expect((_locState as OpenLoc).deleteMetadata).toBeCalled());
    expect((_locState as OpenLoc).deleteFile).toBeCalled();
    expect((_locState as OpenLoc).legalOfficer.deleteLink).toBeCalled();
}

function Voider() {
    const { signer } = useLogionChain();
    const { loc: locData, mutateLocState } = useLocContext();
    const [ call, setCall ] = useState<Call>();

    const callback = useCallback(() => {
        const call: Call = async callback =>
            mutateLocState(async current => {
                if(signer && current instanceof OpenLoc) {
                    return current.legalOfficer.voidLoc({
                        locState: current,
                        voidInfo: {
                            reason: "Some reason"
                        },
                        signer,
                        callback,
                    });
                } else {
                    return current;
                }
            });
        setCall(() => call);
    }, [ mutateLocState ]);

    if(!locData) {
        return null;
    }

    return (
        <div>
            <button onClick={ callback }>Go</button>
            <p>{ locData.voidInfo ? "Voided" : "-" }</p>
            <ClientExtrinsicSubmitter
                call={ call }
                successMessage="Successfully closed"
                onSuccess={ () => {} }
                onError={ () => {} }
            />
        </div>
    );
}

async function thenVoided() {
    expect((_locState as OpenLoc).legalOfficer.voidLoc).toBeCalled();
}
