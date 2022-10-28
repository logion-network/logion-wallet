import { AxiosInstance } from "axios";
import { useCallback, useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { UUID } from "@logion/node-api/dist/UUID";
import { LegalOfficerCase } from '@logion/node-api/dist/Types';
import { LocData, OpenLoc } from "@logion/client";
import { LogionClient } from '@logion/client/dist/LogionClient';
import { PublicApi, LocRequestState, EditableRequest as RealEditableRequest } from "@logion/client";

import { deleteLocLink, resetDefaultMocks } from "../common/__mocks__/ModelMock";
import ExtrinsicSubmitter, { SignAndSubmit } from "../ExtrinsicSubmitter";
import { CLOSED_IDENTITY_LOC, CLOSED_IDENTITY_LOC_ID, OPEN_IDENTITY_LOC, OPEN_IDENTITY_LOC_ID } from "../__mocks__/@logion/node-api/dist/LogionLocMock";
import { finalizeSubmission, resetSubmitting } from "../logion-chain/__mocks__/SignatureMock";
import { clickByName } from "../tests";
import { LocContextProvider, useLocContext } from "./LocContext"
import { LocItemType } from "./types";
import { buildLocRequest } from "./TestData";
import { setClientMock } from "src/logion-chain/__mocks__/LogionChainMock";
import { EditableRequest } from "src/__mocks__/LogionClientMock";
import { addLink, publishFile, publishLink, publishMetadata } from "../legal-officer/client";
import { useLogionChain } from "src/logion-chain";
import ClientExtrinsicSubmitter, { Call, CallCallback } from "src/ClientExtrinsicSubmitter";

jest.mock("@logion/node-api/dist/LogionLoc");
jest.mock("../logion-chain/Signature");
jest.mock("../logion-chain");
jest.mock("../common/CommonContext");
jest.mock("../common/Model");

describe("LocContext", () => {

    it("fetches LOC data", async () => {
        givenRequest(CLOSED_IDENTITY_LOC_ID, CLOSED_IDENTITY_LOC);
        whenRenderingInContext(_locState, <Reader/>);
        await thenReaderDisplaysLocRequestAndItems();
    })

    it("adds items", async () => {
        givenRequest(OPEN_IDENTITY_LOC_ID, OPEN_IDENTITY_LOC, CLOSED_IDENTITY_LOC_ID, CLOSED_IDENTITY_LOC);
        whenRenderingInContext(_locState, <ItemAdder/>);
        await waitFor(() => screen.getByText("Ready"));
        await clickByName("Go");
        await thenItemsAdded();
    })

    it("closes", async () => {
        givenRequest(OPEN_IDENTITY_LOC_ID, OPEN_IDENTITY_LOC);
        resetDefaultMocks();
        resetSubmitting();
        whenRenderingInContext(_locState, <Closer/>);
        await clickByName("Go");
        await waitFor(() => expect(screen.getByText("Submitting...")).toBeVisible());
        finalizeSubmission();
        await thenClosed();
    })

    it("publishes metadata item", async () => publishesItem("Data", "/api/loc-request/9363c3d6-d107-421a-a44b-85c7fab0b843/metadata/New%20data/confirm"))
    it("publishes file item", async () => publishesItem("Document", "/api/loc-request/9363c3d6-d107-421a-a44b-85c7fab0b843/files/new-hash/confirm"))
    it("publishes link item", async () => publishesItem("Linked LOC", "/api/loc-request/9363c3d6-d107-421a-a44b-85c7fab0b843/links/4092e790-a6eb-4f10-8172-90b5dd254521/confirm"))

    it("deletes items", async () => {
        givenRequest(OPEN_IDENTITY_LOC_ID, OPEN_IDENTITY_LOC, CLOSED_IDENTITY_LOC_ID, CLOSED_IDENTITY_LOC);
        givenDraftItems();
        resetDefaultMocks();
        whenRenderingInContext(_locState, <ItemDeleter />);
        await waitFor(() => expect(screen.getByRole("button", {name: "Go"})).not.toBeDisabled());
        await clickByName("Go");
        await thenItemsDeleted();
    })

    it("voids", async () => {
        givenRequest(CLOSED_IDENTITY_LOC_ID, CLOSED_IDENTITY_LOC);
        resetDefaultMocks();
        resetSubmitting();
        whenRenderingInContext(_locState, <Voider/>);
        await clickByName("Go");
        await waitFor(() => expect(screen.getByText("Submitting...")).toBeVisible());
        finalizeSubmission();
        await thenVoided();
    })
})

function givenRequest(locId: string, loc: LegalOfficerCase, linkedLocId?: string, linkedLoc?: LegalOfficerCase) {
    const locsState: any = {};

    _locData = buildLocRequest(UUID.fromDecimalString(locId)!, loc);
    _locState = new EditableRequest();
    _locState.data = () => _locData;
    _locState.locsState = () => locsState,
    _locState.refresh = () => Promise.resolve(_locState),
    _locState.addMetadata = jest.fn().mockResolvedValue(_locState);
    _locState.deleteMetadata = jest.fn().mockResolvedValue(_locState);
    _locState.addFile = jest.fn().mockResolvedValue(_locState);
    _locState.deleteFile = jest.fn().mockResolvedValue( _locState);

    if(linkedLocId && linkedLoc) {
        _linkedLocData = buildLocRequest(UUID.fromDecimalString(linkedLocId)!, linkedLoc);
        _linkedLocState = {
            data: () => _linkedLocData,
            locsState: () => locsState,
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
    } as unknown as AxiosInstance;
    const client = {
        locsState: () => Promise.resolve(locsState),
        public: publicMock,
        legalOfficers: [],
        buildAxios: () => axiosMock,
    } as unknown as LogionClient;
    locsState.client = client;
    setClientMock(client);
}

let _locData: LocData;
let _locState: EditableRequest;
let _linkedLocData: LocData;
let _linkedLocState: LocRequestState;
let axiosMock: AxiosInstance;

function whenRenderingInContext(locState: EditableRequest, element: JSX.Element) {
    render(
        <LocContextProvider
            locState={ locState as unknown as LocRequestState }
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
        await mutateLocState(async (current) => {
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
                return next as unknown as LocRequestState;
            } else {
                return current;
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
    await waitFor(() => expect(_locState.addMetadata).toBeCalled());
    expect(_locState.addFile).toBeCalled();
    expect(axiosMock.post).toBeCalledWith(
        `/api/loc-request/${ _locData.id.toString() }/links`,
        expect.objectContaining({
            "nature": "Some nature",
            "target": _linkedLocData.id.toString(),
        })
    );
}

function Closer() {
    const { loc: locData, closeExtrinsic, close } = useLocContext();
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);

    const callback = useCallback(() => {
        const signAndSubmit: SignAndSubmit = closeExtrinsic!();
        setSignAndSubmit(() => signAndSubmit);
    }, [ closeExtrinsic ]);

    const onSuccess = useCallback(() => {
        close!();
    }, [ close ]);

    if(!locData || !closeExtrinsic || !close) {
        return null;
    }

    return (
        <div>
            <button onClick={ callback }>Go</button>
            <p>{ locData.closed ? "Closed" : "Open" }</p>
            <ExtrinsicSubmitter
                id="close"
                signAndSubmit={ signAndSubmit }
                successMessage="Successfully closed"
                onSuccess={ onSuccess }
                onError={ () => {} }
            />
        </div>
    );
}

async function thenClosed() {
    await waitFor(() => expect(screen.getByText("Closed")).toBeVisible());
}

async function publishesItem(itemType: LocItemType, expectedResource: string) {
    givenRequest(OPEN_IDENTITY_LOC_ID, OPEN_IDENTITY_LOC, CLOSED_IDENTITY_LOC_ID, CLOSED_IDENTITY_LOC);
    givenDraftItems();
    resetDefaultMocks();
    whenRenderingInContext(_locState, <ItemPublisher itemType={ itemType } />);
    resetSubmitting();
    await clickByName("Go");
    await waitFor(() => expect(screen.getByText("Submitting...")).toBeVisible());
    await thenItemsPublished(expectedResource);
}

function givenDraftItems() {
    _locData.metadata.push({
        addedOn: "",
        name: "New data",
        submitter: OPEN_IDENTITY_LOC.owner,
        value: "Some value",
        published: false,
    })
    _locData.files.push({
        hash: "new-hash",
        addedOn: "",
        name: "New file",
        submitter: OPEN_IDENTITY_LOC.owner,
        nature: "Some nature",
        published: false,
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
                item,
                callback,
                signer: signer!,
            })));
        } else if(props.itemType === "Document") {
            const file = locItems.find(item => item.name === "New file")!;
            setSignAndSubmit(() => (callback: CallCallback) => mutateLocState(async current => publishFile({
                locState: current as RealEditableRequest,
                hash: file.value,
                nature: file.name!,
                submitter: file.submitter,
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
    const { locItems, deleteMetadata, deleteLink, mutateLocState } = useLocContext();

    const callback = useCallback(async () => {
        await mutateLocState(async current => {
            if(current instanceof EditableRequest) {
                return current.deleteFile!({
                    hash: "new-hash",
                }) as unknown as RealEditableRequest;
            } else {
                return current;
            }
        });
        deleteMetadata!(locItems.find(item => item.name === "New data")!);
        deleteLink!(locItems.find(item => item.nature === "New link")!);
    }, [ locItems, deleteMetadata, deleteLink ]);

    if(!deleteMetadata || !deleteLink) {
        return null;
    }

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
    await waitFor(() => expect(_locState.deleteMetadata).toBeCalled());
    expect(_locState.deleteFile).toBeCalled();
    expect(deleteLocLink).toBeCalled();
}

function Voider() {
    const { loc: locData, voidLocExtrinsic, voidLoc } = useLocContext();

    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);

    const callback = useCallback(() => {
        const signAndSubmit: SignAndSubmit = voidLocExtrinsic!({});
        setSignAndSubmit(() => signAndSubmit);
    }, [ voidLocExtrinsic ]);

    const onSuccess = useCallback(() => {
        voidLoc!({
            reason: "Some reason"
        });
    }, [ voidLoc ]);

    if(!locData) {
        return null;
    }

    return (
        <div>
            <button onClick={ callback }>Go</button>
            <p>{ locData.voidInfo ? "Voided" : "-" }</p>
            <ExtrinsicSubmitter
                id="void"
                signAndSubmit={ signAndSubmit }
                successMessage="Successfully closed"
                onSuccess={ onSuccess }
                onError={ () => {} }
            />
        </div>
    );
}

async function thenVoided() {
    await waitFor(() => expect(screen.getByText("Voided")).toBeVisible());
}
