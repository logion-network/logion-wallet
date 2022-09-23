import { useCallback, useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { UUID } from "@logion/node-api/dist/UUID";
import { LegalOfficerCase } from '@logion/node-api/dist/Types';
import { LocData } from "@logion/client";
import { LogionClient } from '@logion/client/dist/LogionClient';

import { resetDefaultMocks } from "../common/__mocks__/ModelMock";
import ExtrinsicSubmitter, { SignAndSubmit } from "../ExtrinsicSubmitter";
import { CLOSED_IDENTITY_LOC, CLOSED_IDENTITY_LOC_ID, OPEN_IDENTITY_LOC, OPEN_IDENTITY_LOC_ID } from "../__mocks__/@logion/node-api/dist/LogionLocMock";
import { finalizeSubmission, resetSubmitting } from "../logion-chain/__mocks__/SignatureMock";
import { clickByName } from "../tests";
import { LocContextProvider, useLocContext } from "./LocContext"
import { LocItemType } from "./types";
import { addMetadata, addFile, addLink } from "./__mocks__/ModelMock";
import { buildLocRequest } from "./TestData";
import { setClientMock } from "src/logion-chain/__mocks__/LogionChainMock";

jest.mock("@logion/node-api/dist/LogionLoc");
jest.mock("../logion-chain/Signature");
jest.mock("../logion-chain");
jest.mock("../common/CommonContext");
jest.mock("../common/Model");
jest.mock("./Model");

describe("LocContext", () => {

    it("fetches LOC data", async () => {
        givenRequest(CLOSED_IDENTITY_LOC_ID, CLOSED_IDENTITY_LOC);
        whenRenderingInContext(CLOSED_IDENTITY_LOC_ID, <Reader/>);
        await thenReaderDisplaysLocRequestAndItems();
    })

    it("adds items", async () => {
        givenRequest(OPEN_IDENTITY_LOC_ID, OPEN_IDENTITY_LOC);
        givenOtherRequestForLink();
        givenAddEndpoints();
        whenRenderingInContext(OPEN_IDENTITY_LOC_ID, <ItemAdder/>);
        await clickByName("Go");
        await thenItemsAdded();
    })

    it("closes", async () => {
        givenRequest(OPEN_IDENTITY_LOC_ID, OPEN_IDENTITY_LOC);
        resetDefaultMocks();
        resetSubmitting();
        whenRenderingInContext(OPEN_IDENTITY_LOC_ID, <Closer/>);
        await clickByName("Go");
        await waitFor(() => expect(screen.getByText("Submitting...")).toBeVisible());
        finalizeSubmission();
        await thenClosed();
    })

    it("publishes metadata item", async () => publishesItem("Data"))
    it("publishes file item", async () => publishesItem("Document"))
    it("publishes link item", async () => publishesItem("Linked LOC"))

    it("deletes items", async () => {
        givenRequest(OPEN_IDENTITY_LOC_ID, OPEN_IDENTITY_LOC);
        givenOtherRequestForLink();
        givenDraftItemsToPublish();
        resetDefaultMocks();
        whenRenderingInContext(OPEN_IDENTITY_LOC_ID, <ItemDeleter />);
        await waitFor(() => expect(screen.getByRole("button", {name: "Go"})).not.toBeDisabled());
        await clickByName("Go");
        await thenItemsDeleted();
    })

    it("voids", async () => {
        givenRequest(CLOSED_IDENTITY_LOC_ID, CLOSED_IDENTITY_LOC);
        resetDefaultMocks();
        resetSubmitting();
        whenRenderingInContext(CLOSED_IDENTITY_LOC_ID, <Voider/>);
        await clickByName("Go");
        await waitFor(() => expect(screen.getByText("Submitting...")).toBeVisible());
        finalizeSubmission();
        await thenVoided();
    })
})

function givenRequest(locId: string, loc: LegalOfficerCase) {
    _request = buildLocRequest(UUID.fromDecimalString(locId)!, loc);
    setClientMock({
        locsState: () => Promise.resolve({
            findById: () => Promise.resolve({
                data: () => _request
            })
        }),
        public: {
            findLocById: () => Promise.resolve({
                data: _request
            })
        }
    } as unknown as LogionClient);
}

let _request: LocData;

function whenRenderingInContext(locId: string, element: JSX.Element) {
    render(
        <LocContextProvider locId={ UUID.fromDecimalString(locId)! } backPath="/" detailsPath={() => ""}>
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

function givenOtherRequestForLink() {
    _linkRequest = {
        ..._request,
        description: "New link"
    }
}

let _linkRequest: LocData;

function givenAddEndpoints() {
    addMetadata.mockResolvedValue(undefined);
    addFile.mockResolvedValue({
        hash: "some-hash"
    });
    addLink.mockResolvedValue(undefined);
}

function ItemAdder() {
    const { locItems, addMetadata, addFile, addLink } = useLocContext();

    const callback = useCallback(() => {
        addMetadata!("New data", "value");
        addFile!("New file", new File([], "file.png"), "Some nature");
        addLink!(_linkRequest, "Some nature");
    }, [ addMetadata, addFile, addLink ]);

    if(!addMetadata || !addFile || !addLink) {
        return null;
    }

    return (
        <div>
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
    await waitFor(() => expect(screen.getByText("New data")).toBeVisible());
    expect(screen.getByText("New file")).toBeVisible();
    expect(screen.getByText("New link")).toBeVisible();

    expect(addMetadata).toBeCalled();
    expect(addFile).toBeCalled();
    expect(addLink).toBeCalled();
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

async function publishesItem(itemType: LocItemType) {
    givenRequest(OPEN_IDENTITY_LOC_ID, OPEN_IDENTITY_LOC);
    givenOtherRequestForLink();
    givenDraftItemsToPublish();
    resetDefaultMocks();
    whenRenderingInContext(OPEN_IDENTITY_LOC_ID, <ItemPublisher itemType={ itemType } />);
    resetSubmitting();
    await clickByName("Go");
    await waitFor(() => expect(screen.getByText("Submitting...")).toBeVisible());
    finalizeSubmission();
    await thenItemsPublished();
}

function givenDraftItemsToPublish() {
    _request.metadata.push({
        addedOn: "",
        name: "New data",
        submitter: OPEN_IDENTITY_LOC.owner,
        value: "Some value",
        published: false,
    })
    _request.files.push({
        hash: "new-hash",
        addedOn: "",
        name: "New file",
        submitter: OPEN_IDENTITY_LOC.owner,
        nature: "Some nature",
        published: false,
    })
    _request.links.push({
        addedOn: "",
        id: _linkRequest.id,
        nature: "New link",
        target: _linkRequest.id.toString(),
        published: false,
    })
}

export interface ItemPublisherProps {
    itemType: LocItemType;
}

function ItemPublisher(props: ItemPublisherProps) {
    const { locItems, publishMetadata, publishFile, publishLink, confirmMetadata, confirmFile, confirmLink } = useLocContext();
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);

    const callback = useCallback(() => {
        if(props.itemType === "Data") {
            setSignAndSubmit(() => publishMetadata!(locItems.find(item => item.name === "New data")!));
        } else if(props.itemType === "Document") {
            setSignAndSubmit(() => publishFile!(locItems.find(item => item.name === "New file")!));
        } else if(props.itemType === "Linked LOC") {
            setSignAndSubmit(() => publishLink!(locItems.find(item => item.nature === "New link")!));
        }
    }, [ locItems, setSignAndSubmit, publishMetadata, publishFile, publishLink ]);

    const onSuccess = useCallback(() => {
        if(props.itemType === "Data") {
            confirmMetadata!(locItems.find(item => item.name === "New data")!)
        } else if(props.itemType === "Document") {
            confirmFile!(locItems.find(item => item.name === "New file")!)
        } else if(props.itemType === "Linked LOC") {
            confirmLink!(locItems.find(item => item.nature === "New link")!)
        }
    }, [ locItems, confirmMetadata, confirmFile, confirmLink ]);

    const hasExpectedItem = useCallback(() => {
        if(props.itemType === "Data") {
            return locItems.find(item => item.name === "New data") !== undefined;
        } else if(props.itemType === "Document") {
            return locItems.find(item => item.name === "New file") !== undefined;
        } else if(props.itemType === "Linked LOC") {
            return locItems.find(item => item.nature === "New link") !== undefined;
        }
    }, [ props.itemType, locItems ]);

    if(!hasExpectedItem() || !publishMetadata || !publishFile || !publishLink || !confirmMetadata) {
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
            <ExtrinsicSubmitter
                id="publish"
                signAndSubmit={ signAndSubmit }
                successMessage="Successfully published"
                onSuccess={ onSuccess }
                onError={ () => {} }
            />
        </div>
    );
}

async function thenItemsPublished() {
    await waitFor(() => expect(screen.getByText(/New|Description/)).toBeVisible());
}

function ItemDeleter() {
    const { locItems, deleteMetadata, deleteFile, deleteLink } = useLocContext();

    const callback = useCallback(() => {
        deleteMetadata!(locItems.find(item => item.name === "New data")!);
        deleteFile!(locItems.find(item => item.name === "New file")!);
        deleteLink!(locItems.find(item => item.nature === "New link")!);
    }, [ locItems, deleteMetadata, deleteFile, deleteLink ]);

    if(!deleteMetadata || !deleteFile || !deleteLink) {
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
    await waitFor(() => expect(screen.queryAllByRole("listitem").length).toBe(0));
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
