import { render, screen } from "@testing-library/react";
import Nominate from "./Nominate";
import { expectNoDialogVisible, clickByName } from "../../tests";
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

    it("renders unchecked with nomination info when not verified issuer", async () => {
        const locState = new ClosedLoc();
        locState.data = () => ({
            locType: "Identity",
            status: "CLOSED",
            verifiedIssuer: false
        } as LocData);
        setLocState(locState);
        render(<Nominate />);
        await clickByName(/Verified Issuer/);
        expect(screen.getByText("Verified Issuer Nomination")).toBeDefined();
    })

    it("renders checked with dismissal info when verified issuer", async () => {
        const locState = new ClosedLoc();
        locState.data = () => ({
            locType: "Identity",
            status: "CLOSED",
            verifiedIssuer: true
        } as LocData);
        setLocState(locState);
        render(<Nominate />);
        await clickByName(/Verified Issuer/);
        expect(screen.getByText("Verified Issuer Dismissal")).toBeDefined();
    })
})

