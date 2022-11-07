import LocLinkButton from "./LocLinkButton";
import { clickByName, shallowRender, typeByLabel } from "../tests";
import { render, screen, waitFor } from "@testing-library/react";
import { OPEN_IDENTITY_LOC, OPEN_IDENTITY_LOC_ID } from "src/__mocks__/@logion/node-api/dist/LogionLocMock";
import { setClientMock } from "src/logion-chain/__mocks__/LogionChainMock";
import { LocsState, LogionClient } from "@logion/client";
import { buildLocRequest } from "./TestData";
import { UUID } from "@logion/node-api";

jest.mock("./LocContext");
jest.mock("../logion-chain");
jest.mock("../logion-chain/Signature");
jest.mock("../common/Model");

describe("LocLinkButton", () => {

    it("renders", () => {
        const tree = shallowRender(<LocLinkButton />)
        expect(tree).toMatchSnapshot();
    })

    it("links to an existing LOC", async () => {
        setClientMock({
            locsState: () => Promise.resolve({
                findById: () => ({
                    data: () => buildLocRequest(UUID.fromDecimalStringOrThrow(OPEN_IDENTITY_LOC_ID), OPEN_IDENTITY_LOC),
                }),
            }) as unknown as LocsState,
        } as unknown as LogionClient)

        render(<LocLinkButton />);
        await clickByName(content => /Link to an existing LOC/i.test(content));
        let dialog: HTMLElement;
        await waitFor(() => dialog = screen.getByRole("dialog"));
        await typeByLabel("Please set the LOC ID you would like to link with this LOC:", OPEN_IDENTITY_LOC_ID);
        await typeByLabel("Link Public Description", "Some nature");
        await clickByName("Submit");

        await waitFor(() => expect(dialog).not.toBeVisible())
    })
})
