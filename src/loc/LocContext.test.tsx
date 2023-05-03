import { AxiosInstance } from "axios";
import { useCallback, useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { UUID, LegalOfficerCase } from '@logion/node-api';
import { LocData, OpenLoc as RealOpenLoc } from "@logion/client";
import { LogionClient } from '@logion/client/dist/LogionClient.js';
import { PublicApi, EditableRequest as RealEditableRequest, LocRequestState as RealLocRequestState } from "@logion/client";
import { SubmittableExtrinsic } from "@polkadot/api-base/types";
import { Compact, u128 } from "@polkadot/types-codec";
import { PalletLogionLocFile, PalletLogionLocMetadataItem } from '@polkadot/types/lookup';

import { resetDefaultMocks } from "../common/__mocks__/ModelMock";
import { clickByName } from "../tests";
import { LocContextProvider, useLocContext } from "./LocContext"
import { LocItemType } from "./LocItem";
import { buildLocRequest } from "./TestData";
import { setClientMock } from "src/logion-chain/__mocks__/LogionChainMock";
import { LocRequestState, EditableRequest, OpenLoc, ClosedLoc } from "src/__mocks__/LogionClientMock";
import { addLink, closeLoc, deleteLink, publishFile, publishLink, publishMetadata, voidLoc } from "../legal-officer/client";
import { useLogionChain } from "src/logion-chain";
import ClientExtrinsicSubmitter, { Call, CallCallback } from "src/ClientExtrinsicSubmitter";
import { mockValidPolkadotAccountId, setupApiMock, api, CLOSED_IDENTITY_LOC, CLOSED_IDENTITY_LOC_ID, OPEN_IDENTITY_LOC, OPEN_IDENTITY_LOC_ID } from 'src/__mocks__/LogionMock';
import { It, Mock } from "moq.ts";

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

    it("closes", async () => {
        givenRequest(OPEN_IDENTITY_LOC_ID, OPEN_IDENTITY_LOC, OpenLoc);
        resetDefaultMocks();
        setupApiMock(api => {
            const submittable = new Mock<SubmittableExtrinsic<"promise">>();
            api.setup(instance => instance.polkadot.tx.logionLoc.close(It.IsAny())).returns(submittable.object());
            const locId = new Mock<Compact<u128>>();
            api.setup(instance => instance.adapters.toLocId(It.IsAny())).returns(locId.object());
        });
        whenRenderingInContext(_locState, <Closer/>);
        await clickByName("Go");
        await waitFor(() => expect(screen.getByText("Submitting...")).toBeVisible());
        await thenClosed();
    })

    it("publishes metadata item", async () => publishesItem("Data", "/api/loc-request/9363c3d6-d107-421a-a44b-85c7fab0b843/metadata/New%20data/confirm"))
    it("publishes file item", async () => publishesItem("Document", "/api/loc-request/9363c3d6-d107-421a-a44b-85c7fab0b843/files/new-hash/confirm"))
    it("publishes link item", async () => publishesItem("Linked LOC", "/api/loc-request/9363c3d6-d107-421a-a44b-85c7fab0b843/links/4092e790-a6eb-4f10-8172-90b5dd254521/confirm"))

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
        givenRequest(CLOSED_IDENTITY_LOC_ID, CLOSED_IDENTITY_LOC, ClosedLoc);
        resetDefaultMocks();
        setupApiMock(api => {
            const submittable = new Mock<SubmittableExtrinsic<"promise">>();
            api.setup(instance => instance.polkadot.tx.logionLoc.makeVoid(It.IsAny())).returns(submittable.object());
            const locId = new Mock<Compact<u128>>();
            api.setup(instance => instance.adapters.toLocId(It.IsAny())).returns(locId.object());
        });
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

    locsState.findById = (argLocId: UUID) => {
        if (argLocId.toDecimalString() === locId) {
            return _locState;
        } else if (linkedLocId && linkedLoc && argLocId.toDecimalString() === linkedLocId) {
            return _linkedLocState;
        } else {
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
        legalOfficers: [],
        buildAxios: () => axiosMock,
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
        expect(screen.getByText(`File ${i}`)).toBeVisible();
    }
    for(let i = 0; i < CLOSED_IDENTITY_LOC.metadata.length; ++i) {
        expect(screen.getByText(`Data ${i}`)).toBeVisible();
    }
    for(let i = 0; i < CLOSED_IDENTITY_LOC.links.length; ++i) {
        expect(screen.getByText(`Link ${i}`)).toBeVisible();
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
                next = await addLink({
                    locState: current as unknown as RealEditableRequest,
                    target: _linkedLocData.id,
                    nature: "Some nature"
                });
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
    expect(axiosMock.post).toBeCalledWith(
        `/api/loc-request/${ _locData.id.toString() }/links`,
        expect.objectContaining({
            "nature": "Some nature",
            "target": _linkedLocData.id.toString(),
        })
    );
}

function Closer() {
    const { signer } = useLogionChain();
    const { loc: locData, mutateLocState } = useLocContext();
    const [ call, setCall ] = useState<Call>();

    const callback = useCallback(async () => {
        const call: Call = async callback =>
            mutateLocState(async current => {
                if(signer && current instanceof OpenLoc) {
                    return closeLoc({
                        locState: current as unknown as RealOpenLoc,
                        signer,
                        callback,
                    });
                } else {
                    return current;
                }
            });
        setCall(() => call);
    }, [ signer, mutateLocState ]);

    if(!locData || !signer) {
        return null;
    }

    return (
        <div>
            <button onClick={ callback }>Go</button>
            <p>{ locData.closed ? "Closed" : "Open" }</p>
            <ClientExtrinsicSubmitter
                call={ call }
                successMessage="Successfully closed"
                onSuccess={ () => {} }
                onError={ () => {} }
            />
        </div>
    );
}

async function thenClosed() {
    await waitFor(() => expect(axiosMock.post).toBeCalledWith(`/api/loc-request/9363c3d6-d107-421a-a44b-85c7fab0b843/close`));
}

async function publishesItem(itemType: LocItemType, expectedResource: string) {
    givenRequest(OPEN_IDENTITY_LOC_ID, OPEN_IDENTITY_LOC, OpenLoc, CLOSED_IDENTITY_LOC_ID, CLOSED_IDENTITY_LOC);
    givenDraftItems();
    resetDefaultMocks();
    setupApiMock(api => {
        const submittable = new Mock<SubmittableExtrinsic<"promise">>();
        if(itemType === "Data") {
            api.setup(instance => instance.polkadot.tx.logionLoc.addMetadata(It.IsAny(), It.IsAny())).returns(submittable.object());
            const metadata = new Mock<PalletLogionLocMetadataItem>();
            api.setup(instance => instance.adapters.toPalletLogionLocMetadataItem(It.IsAny())).returns(metadata.object());
        } else if(itemType === "Document") {
            api.setup(instance => instance.polkadot.tx.logionLoc.addFile(It.IsAny(), It.IsAny())).returns(submittable.object());
            const locFile = new Mock<PalletLogionLocFile>();
            api.setup(instance => instance.adapters.toLocFile(It.IsAny())).returns(locFile.object());
        } else if(itemType === "Linked LOC") {
            api.setup(instance => instance.polkadot.tx.logionLoc.addLink(It.IsAny(), It.IsAny())).returns(submittable.object());
        }
        const locId = new Mock<Compact<u128>>();
        api.setup(instance => instance.adapters.toLocId(It.IsAny())).returns(locId.object());
    });
    whenRenderingInContext(_locState, <ItemPublisher itemType={ itemType } />);
    await clickByName("Go");
    await waitFor(() => expect(screen.getByText("Submitting...")).toBeVisible());
    await thenItemsPublished(expectedResource);
}

function givenDraftItems() {
    _locData.metadata.push({
        addedOn: "",
        name: "New data",
        submitter: mockValidPolkadotAccountId(OPEN_IDENTITY_LOC.owner),
        value: "Some value",
        published: false,
    })
    _locData.files.push({
        hash: "new-hash",
        addedOn: "",
        name: "New file",
        submitter: mockValidPolkadotAccountId(OPEN_IDENTITY_LOC.owner),
        nature: "Some nature",
        published: false,
        restrictedDelivery: false,
        contentType: "text/plain",
        size: 42n,
    })
    _locData.links.push({
        addedOn: "",
        id: _linkedLocData.id,
        nature: "New link",
        target: _linkedLocData.id.toString(),
        published: false,
    })
}

export interface ItemPublisherProps {
    itemType: LocItemType;
}

function ItemPublisher(props: ItemPublisherProps) {
    const { signer } = useLogionChain();
    const { locItems, mutateLocState } = useLocContext();
    const [ signAndSubmit, setSignAndSubmit ] = useState<Call>();

    const callback = useCallback(() => {
        if(props.itemType === "Data") {
            const item = locItems.find(item => item.name === "New data")!;
            setSignAndSubmit(() => (callback: CallCallback) => mutateLocState(async current => publishMetadata({
                locState: current as RealEditableRequest,
                item: {
                    name: item.name!,
                    value: item.value!,
                    submitter: item.submitter!,
                },
                signer: signer!,
                callback,
            })));
        } else if(props.itemType === "Document") {
            const file = locItems.find(item => item.name === "New file")!;
            setSignAndSubmit(() => (callback: CallCallback) => mutateLocState(async current => publishFile({
                locState: current as RealEditableRequest,
                hash: file.value!,
                nature: file.name!,
                submitter: file.submitter!,
                size: file.size!,
                callback,
                signer: signer!,
            })));
        } else if(props.itemType === "Linked LOC") {
            const link = locItems.find(item => item.nature === "New link")!;
            setSignAndSubmit(() => (callback: CallCallback) => mutateLocState(async current => publishLink({
                locState: current as RealEditableRequest,
                target: link.target!,
                nature: link.name!,
                callback,
                signer: signer!,
            })));
        }
    }, [ locItems, setSignAndSubmit, publishMetadata, publishFile, publishLink ]);

    const hasExpectedItem = useCallback(() => {
        if(props.itemType === "Data") {
            return locItems.find(item => item.name === "New data") !== undefined;
        } else if(props.itemType === "Document") {
            return locItems.find(item => item.name === "New file") !== undefined;
        } else if(props.itemType === "Linked LOC") {
            return locItems.find(item => item.nature === "New link") !== undefined;
        }
    }, [ props.itemType, locItems ]);

    if(!hasExpectedItem()) {
        return null;
    }

    return (
        <div>
            <button onClick={ callback }>Go</button>
            <ul>
                {
                    locItems.filter(item => item.status === "PUBLISHED").map((item, index) => <li key={ index }>
                        <p>{ item.name }</p>
                    </li>)
                }
            </ul>
            <ClientExtrinsicSubmitter
                call={ signAndSubmit }
                successMessage="Successfully published"
                onSuccess={ () => {} }
                onError={ () => {} }
            />
        </div>
    );
}

async function thenItemsPublished(expectedResource: string) {
    await waitFor(() => expect(axiosMock.put).toBeCalledWith(expectedResource));
}

function ItemDeleter() {
    const { locItems, mutateLocState } = useLocContext();

    const callback = useCallback(async () => {
        await mutateLocState(async current => {
            if(current instanceof EditableRequest) {
                let next: RealEditableRequest;
                next = current.deleteFile!({
                    hash: "new-hash",
                }) as unknown as RealEditableRequest;
                next = deleteLink({
                    locState: current as unknown as RealEditableRequest,
                    target: locItems.find(item => item.nature === "New link")!.target!,
                }) as unknown as RealEditableRequest;
                next = current.deleteMetadata!({
                    hash: "New data",
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
    expect(axiosMock.delete).toBeCalledWith("/api/loc-request/9363c3d6-d107-421a-a44b-85c7fab0b843/links/4092e790-a6eb-4f10-8172-90b5dd254521");
}

function Voider() {
    const { signer } = useLogionChain();
    const { loc: locData, mutateLocState } = useLocContext();
    const [ call, setCall ] = useState<Call>();

    const callback = useCallback(() => {
        const call: Call = async callback =>
            mutateLocState(async current => {
                if(signer) {
                    return voidLoc({
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
    await waitFor(() => expect(axiosMock.post).toBeCalledWith(
        `/api/loc-request/4092e790-a6eb-4f10-8172-90b5dd254521/void`,
        expect.objectContaining({
            reason: "Some reason",
        })
    ));
}
