jest.mock("../common/CommonContext");
jest.mock("../logion-chain");
jest.mock("src/legal-officer/LegalOfficerContext");
jest.mock("./UserLocContext");
jest.mock("./FileModel");
jest.mock("./LocContext");
jest.mock("src/legal-officer/LegalOfficerContext");
jest.unmock("@logion/node-api/dist/LogionLoc.js");

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LocData } from "@logion/client";
import { UUID } from "@logion/node-api/dist/UUID.js";

import { LOCollectionLocItemChecker, UserCollectionLocItemChecker, Props } from "./CollectionLocItemChecker";
import { DEFAULT_LEGAL_OFFICER } from "src/common/TestData";
import { clickByName } from "src/tests";
import { setLocState } from "./__mocks__/UserLocContextMock";
import { setLocState as setLoLocState, setLocRequest } from "./__mocks__/LocContextMock";
import { CollectionItem } from "@logion/client";
import { toItemId } from "./types";

describe("CollectionLocItemChecker", () => {

    it("renders", () => {
        const result = render(<LOCollectionLocItemChecker collectionLoc={ locData } />);
        expect(result).toMatchSnapshot();
    })
})

describe("UserCollectionLocItemChecker", () => {

    it("shows positive match with item ID", async () => {
        setLocState(locState);
        testWithItemId("test", UserCollectionLocItemChecker);
        await waitFor(() => expect(screen.getByText("positive")).toBeVisible());
    })

    it("shows negative match with wrong item ID", async () => {
        setLocState(locState);
        testWithItemId("test2", UserCollectionLocItemChecker);
        await waitFor(() => expect(screen.getByText("negative")).toBeVisible());
    })
})

describe("LOCollectionLocItemChecker", () => {

    it("shows positive match with item ID", async () => {
        setLoLocState(locState);
        setLocRequest(locData);
        testWithItemId("test", LOCollectionLocItemChecker);
        await waitFor(() => expect(screen.getByText("positive")).toBeVisible());
    })

    it("shows negative match with wrong item ID", async () => {
        setLoLocState(locState);
        setLocRequest(locData);
        testWithItemId("test2", LOCollectionLocItemChecker);
        await waitFor(() => expect(screen.getByText("negative")).toBeVisible());
    })
})

const locId = new UUID("d97c99fd-9bcc-4f92-b9ea-b6be93abbbcd");
const itemId = toItemId("test")!;
const item = {
    files: [],
    termsAndConditions: [],
} as unknown as CollectionItem;
const locState = {
    size: () => Promise.resolve(1),
    checkHash: (checkHashItemId: string) => {
        if(checkHashItemId === itemId) {
            return Promise.resolve({ collectionItem: item });
        } else {
            return Promise.resolve({});
        }
    },
    getCollectionItem: (args: { itemId: string }) => {
        if(args.itemId === itemId) {
            return Promise.resolve(item);
        } else {
            return Promise.resolve();
        }
    }
};
const locData = {
    id: locId,
    ownerAddress: DEFAULT_LEGAL_OFFICER,
    metadata: [],
    files: [],
} as unknown as LocData;

async function testWithItemId(itemIdText: string, elementFunction: (props: Props) => JSX.Element | null) {
    render(elementFunction({ collectionLoc: locData }) || <div></div>);
    const itemIdInput = screen.getByTestId("item-id");
    await userEvent.type(itemIdInput, itemIdText);
    await clickByName(content => /Check Item ID/.test(content));
}
