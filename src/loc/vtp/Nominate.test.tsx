import { render, screen } from "@testing-library/react";
import Nominate from "./Nominate";
import { expectNoDialogVisible, shallowRender, clickByName } from "../../tests";
import { ClosedLoc } from "../../__mocks__/LogionClientMock";
import { LocData } from "@logion/client";
import { setLocState } from "../__mocks__/LocContextMock";

jest.mock("../../logion-chain");
jest.mock("../LocContext");
jest.mock("../../legal-officer/client");

describe("Nominate", () => {

    it("shows no dialog at startup", () => {
        render(<Nominate />);
        expectNoDialogVisible();
    })

    it("renders unchecked with nomination info when not verified third party", async () => {
        const locState = new ClosedLoc();
        locState.data = () => ({
            locType: "Identity",
            status: "CLOSED",
            verifiedThirdParty: false
        } as LocData);
        setLocState(locState);
        render(<Nominate />);
        await clickByName(/Verified Third Party/);
        expect(screen.getByText("Verified Third Party Nomination")).toBeDefined();
    })

    it("renders checked with dismissal info when verified third party", async () => {
        const locState = new ClosedLoc();
        locState.data = () => ({
            locType: "Identity",
            status: "CLOSED",
            verifiedThirdParty: true
        } as LocData);
        setLocState(locState);
        render(<Nominate />);
        await clickByName(/Verified Third Party/);
        expect(screen.getByText("Verified Third Party Dismissal")).toBeDefined();
    })
})

