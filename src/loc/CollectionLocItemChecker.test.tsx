jest.mock("../common/CommonContext");
jest.mock("../logion-chain");
jest.mock("src/legal-officer/LegalOfficerContext");
jest.mock("./UserLocContext");
jest.mock("./FileModel");
jest.mock("./LocContext");
jest.mock("src/legal-officer/LegalOfficerContext");

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LocData, HashString } from "@logion/client";
import { UUID, Hash } from "@logion/node-api";

import { LOCollectionLocItemChecker, UserCollectionLocItemChecker, Props } from "./CollectionLocItemChecker";
import { DEFAULT_LEGAL_OFFICER } from "src/common/TestData";
import { clickByName } from "src/tests";
import { setLocState } from "./__mocks__/UserLocContextMock";
import { setLocState as setLoLocState, setLocRequest } from "./__mocks__/LocContextMock";
import { CollectionItem } from "@logion/client";
import { toItemId } from "./types";
import { It } from "moq.ts";
import { setupApiMock } from "src/__mocks__/LogionMock";

describe("CollectionLocItemChecker", () => {

    it("renders", () => {
        setupApiMock(api => {
            api.setup(instance => instance.queries.getCollectionSize(It.IsAny())).returnsAsync(1);
        });
        const result = render(<LOCollectionLocItemChecker collectionLoc={ locData } />);
        expect(result).toMatchSnapshot();
    })
})

describe("UserCollectionLocItemChecker", () => {

    it("shows positive match with item ID", async () => {
        setLocState(locState);
        await testWithItemId("test", UserCollectionLocItemChecker);
        await waitFor(() => expect(screen.getByText("positive")).toBeVisible());
    })

    it("shows negative match with wrong item ID", async () => {
        setLocState(locState);
        await testWithItemId("test2", UserCollectionLocItemChecker);
        await waitFor(() => expect(screen.getByText("negative")).toBeVisible());
    })
})

describe("LOCollectionLocItemChecker", () => {

    it("shows positive match with item ID", async () => {
        setLoLocState(locState);
        setLocRequest(locData);
        setupApiMock(api => {
            api.setup(instance => instance.queries.getCollectionSize(It.IsAny())).returnsAsync(1);
        });
        await testWithItemId("test", LOCollectionLocItemChecker);
        await waitFor(() => expect(screen.getByText("positive")).toBeVisible());
    })

    it("shows negative match with wrong item ID", async () => {
        setLoLocState(locState);
        setLocRequest(locData);
        await testWithItemId("test2", LOCollectionLocItemChecker);
        await waitFor(() => expect(screen.getByText("negative")).toBeVisible());
    })
})

const locId = new UUID("d97c99fd-9bcc-4f92-b9ea-b6be93abbbcd");
const itemId = toItemId("test")!;
const item = {
    id: itemId,
    description: HashString.fromValue("description"),
    files: [],
    termsAndConditions: [],
} as unknown as CollectionItem;
const locState = {
    size: () => Promise.resolve(1),
    checkHash: (checkHashItemId: Hash) => {
        if(checkHashItemId.equalTo(itemId)) {
            return Promise.resolve({ collectionItem: item });
        } else {
            return Promise.resolve({});
        }
    },
    getCollectionItem: (args: { itemId: Hash }) => {
        if(args.itemId.equalTo(itemId)) {
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
