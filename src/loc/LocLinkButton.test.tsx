import LocLinkButton from "./LocLinkButton";
import { clickByName, shallowRender, typeByLabel } from "../tests";
import { render, screen, waitFor } from "@testing-library/react";
import { OPEN_IDENTITY_LOC, OPEN_IDENTITY_LOC_ID } from "src/__mocks__/@logion/node-api/dist/LogionLocMock";
import { setClientMock } from "src/logion-chain/__mocks__/LogionChainMock";
import { LocsState, LogionClient } from "@logion/client";
import { buildLocRequest } from "./TestData";
import { UUID } from "@logion/node-api";
import { finalizeSubmission } from "src/logion-chain/__mocks__/SignatureMock";

jest.mock("./LocContext");
jest.mock("../logion-chain");
jest.mock("../logion-chain/Signature");
jest.mock("../common/Model");

describe("LocLinkButton", () => {

    it("renders", () => {
        const tree = shallowRender(<LocLinkButton excludeNewIdentity={ false } />)
        expect(tree).toMatchSnapshot();
    })

    it("renders and excludes new identity", () => {
        const tree = shallowRender(<LocLinkButton excludeNewIdentity={ true } />)
        expect(tree).toMatchSnapshot();
    })

    it("links to an existing LOC", async () => {
        setClientMock({
            locsState: () => Promise.resolve({
                findById: () => Promise.resolve({
                    data: () => buildLocRequest(UUID.fromDecimalStringOrThrow(OPEN_IDENTITY_LOC_ID), OPEN_IDENTITY_LOC),
                }),
            }) as unknown as LocsState,
        } as unknown as LogionClient)

        render(<LocLinkButton excludeNewIdentity={ false } />);
        await clickByName("Link this LOC to another LOC");
        await clickByName("Link to an existing LOC");
        let dialog: HTMLElement;
        await waitFor(() => dialog = screen.getByRole("dialog"));
        await typeByLabel("Please set the LOC ID you would like to link with this LOC:", OPEN_IDENTITY_LOC_ID);
        await typeByLabel("Link Public Description", "Some nature");
        await clickByName("Submit");

        await waitFor(() => expect(dialog).not.toBeVisible())
    })

    it("links to a new transaction LOC", () => testWithNewLoc("Transaction"))
    it("links to a new identity LOC", () => testWithNewLoc("Identity"))
})

async function testWithNewLoc(locType: "Identity" | "Transaction") {
    render(<LocLinkButton excludeNewIdentity={ false } />);
    await clickByName("Link this LOC to another LOC");
    await clickByName(`Link to a new ${locType} LOC`);
    let dialog: HTMLElement;
    await waitFor(() => dialog = screen.getByRole("dialog"));
    await typeByLabel("LOC Private Description", "Some description");
    await typeByLabel("Link Public Description", "Some nature");
    await clickByName("Submit");
    await waitFor(() => screen.getByText("Submitting..."));
    finalizeSubmission();
    await waitFor(() => screen.getByText("LOC successfully created."));
    await clickByName("OK");

    await waitFor(() => expect(dialog).not.toBeVisible())
}
