jest.mock("../../common/CommonContext");
jest.mock("../UserLocContext");
jest.mock("../LocContext");

import { render, screen, waitFor, } from "@testing-library/react";
import TokensRecordFrame from "./TokensRecordFrame";
import userEvent from "@testing-library/user-event";
import { clickByName } from "../../tests";
import { HashString, LocClient } from "@logion/client";
import { Hash, UUID } from "@logion/node-api";
import { TokensRecord } from "@logion/client/dist/TokensRecord";
import { setLocState } from "../__mocks__/LocContextMock";
import { ClosedCollectionLoc } from "../../__mocks__/LogionClientMock";
import { TEST_WALLET_USER2 } from "src/wallet-user/TestData";

describe("TokensRecordFrame", () => {

    it("renders", () => {
        const result = render(<TokensRecordFrame/>);
        expect(result).toMatchSnapshot();
    })

    it("shows positive match with item ID", async () => {
        setLocState(mockLocState());
        await testWithInput("record-matched");
        await waitFor(() => expect(screen.getByText("positive")).toBeVisible());
    })

    it("shows negative match with item ID", async () => {
        setLocState(mockLocState());
        await testWithInput("non-existing-record");
        await waitFor(() => expect(screen.getByText("negative")).toBeVisible());
    })

})

async function testWithInput(inputValue: string) {
    render(<TokensRecordFrame/>);
    const inputField = screen.getByTestId("tokens-record-id");
    await userEvent.type(inputField, inputValue);
    await clickByName(content => /Check Tokens Record ID/.test(content));
}

function mockLocState(): ClosedCollectionLoc {

    const matched = mockTokensRecord("record-matched");
    const other = mockTokensRecord("record-other");

    const locState = new ClosedCollectionLoc();
    locState.getTokensRecord = (args: { recordId: Hash }) => {
        if (args.recordId.equalTo(matched.id)) {
            return Promise.resolve(matched);
        } else {
            return Promise.resolve(undefined);
        }
    };
    locState.getTokensRecords = () => {
        return Promise.resolve([ matched, other ]);
    };
    return locState;
}

function mockTokensRecord(idSeed: string): TokensRecord {
    const tokensRecord = {
        id: Hash.of(idSeed),
        description: HashString.fromValue("Record Description"),
        addedOn: "2022-08-23T07:27:46.128Z",
        issuer: TEST_WALLET_USER2,
        files: [ {
            name: HashString.fromValue("record-file-name.txt"),
            hash: Hash.of("record-file-content"),
            size: 10n,
            uploaded: true,
            contentType: HashString.fromValue("text/plain")
        } ]
    };
    return new TokensRecord({
        locId: new UUID("d97c99fd-9bcc-4f92-b9ea-b6be93abbbcd"),
        locClient: {} as LocClient,
        tokensRecord
    });
}
