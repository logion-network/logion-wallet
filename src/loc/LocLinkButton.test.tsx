import LocLinkButton from "./LocLinkButton";
import { clickByName, shallowRender, typeByLabel } from "../tests";
import { render, screen, waitFor } from "@testing-library/react";
import { setClientMock } from "src/logion-chain/__mocks__/LogionChainMock";
import { LogionClient } from "@logion/client";
import { buildLocRequest } from "./TestData";
import { UUID } from "@logion/node-api";
import { setupQueriesGetLegalOfficerCase } from "src/test/Util";
import { setupApiMock, api, OPEN_IDENTITY_LOC, OPEN_IDENTITY_LOC_ID } from "src/__mocks__/LogionMock";
import { setLocState } from "./__mocks__/LocContextMock";

jest.mock("./LocContext");
jest.mock("../logion-chain");
jest.mock("../logion-chain/Signature");
jest.mock("../common/Model");

describe("LocLinkButton", () => {

    it("renders", () => {
        const tree = shallowRender(<LocLinkButton text="Link to an existing LOC"/>)
        expect(tree).toMatchSnapshot();
    })

    it("links to an existing LOC", async () => {
        const locsState = {
            findByIdOrUndefined: () => ({
                data: () => buildLocRequest(UUID.fromDecimalStringOrThrow(OPEN_IDENTITY_LOC_ID), OPEN_IDENTITY_LOC),
            }),
        };
        setClientMock({
            locsState: () => Promise.resolve(locsState),
            logionApi: api.object(),
        } as unknown as LogionClient);
        setupApiMock(api => {
            setupQueriesGetLegalOfficerCase(api, UUID.fromDecimalStringOrThrow(OPEN_IDENTITY_LOC_ID), OPEN_IDENTITY_LOC);
        });
        setLocState({
            locsState: () => locsState,
        });

        render(<LocLinkButton text="Link to an existing LOC"/>);
        await clickByName(content => /Link to an existing LOC/i.test(content));
        let dialog: HTMLElement;
        await waitFor(() => dialog = screen.getByRole("dialog"));
        await typeByLabel("Please set the LOC ID you would like to link with this LOC:", OPEN_IDENTITY_LOC_ID);
        await typeByLabel("Link Public Description", "Some nature");
        await clickByName("Submit");

        await waitFor(() => expect(dialog).not.toBeVisible())
    })
})
