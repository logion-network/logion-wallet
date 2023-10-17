import { LocData } from "@logion/client";
import { UUID, Hash } from "@logion/node-api";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEFAULT_ADDRESS } from "src/common/TestData";
import { clickByName, shallowRender } from "src/tests"
import RestrictedDeliveryCell from "./RestricedDeliveryCell"
import { setLocState } from "./__mocks__/LocContextMock";
import { OpenLoc } from "src/__mocks__/LogionClientMock";

jest.mock("./LocContext");

describe("RestrictedDeliveryCell", () => {

    beforeEach(() => {
        openLoc = new OpenLoc();
        openLoc.legalOfficer.setCollectionFileRestrictedDelivery = setCollectionFileRestrictedDelivery;
    });

    it("renders", () => {
        openLoc.data = () => ({
            files: [{
                hash,
                name: "File name",
                nature: "Some nature",
                published: false,
                restrictedDelivery: false,
                submitter: DEFAULT_ADDRESS,
            }],
            status: "OPEN",
        } as unknown as LocData);
        setLocState(openLoc);
        const result = shallowRender(<RestrictedDeliveryCell hash={hash}/>);
        expect(result).toMatchSnapshot();
    });

    it("asks confirmation on authorization", () => testConfirm(false));
    it("asks confirmation on cancellation", () => testConfirm(true));

    it("does nothing on cancelled authorization", () => testDoesNothing(false));
    it("does nothing on cancelled cancellation", () => testDoesNothing(true));
});

const hash = Hash.of("some-hash");

let openLoc: OpenLoc;

function setCollectionFileRestrictedDelivery(params: any) {
    const hash = params.hash;
    const file = openLoc.data().files.find((file: any) => file.hash === hash);
    if(file) {
        file.restrictedDelivery = params.restrictedDelivery;
    } else {
        throw new Error();
    }
    return params.locState;
}

function renderGivenFile(restrictedDelivery: boolean) {
    const data = {
        id: new UUID("b0944596-264d-4ebe-89e7-ab5562cbeff8"),
        files: [{
            hash,
            name: "File name",
            nature: "Some nature",
            published: false,
            restrictedDelivery,
            submitter: DEFAULT_ADDRESS,
        }]
    } as unknown as LocData;
    openLoc.data = () => data;
    setLocState(openLoc);
    render(<RestrictedDeliveryCell hash={hash}/>);
}

async function testConfirm(restrictedDelivery: boolean) {
    renderGivenFile(!restrictedDelivery);

    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);
    await clickByName("Confirm");

    expect(openLoc.data().files[0].restrictedDelivery).toBe(restrictedDelivery);
}

async function testDoesNothing(restrictedDelivery: boolean) {
    renderGivenFile(!restrictedDelivery);

    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);
    await clickByName("Cancel");

    expect(openLoc.data().files[0].restrictedDelivery).toBe(!restrictedDelivery);
}
