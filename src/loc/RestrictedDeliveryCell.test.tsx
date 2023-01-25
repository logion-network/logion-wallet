import { LocData } from "@logion/client";
import { UUID } from "@logion/node-api";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEFAULT_ADDRESS } from "src/common/TestData";
import { clickByName, shallowRender } from "src/tests"
import RestrictedDeliveryCell from "./RestricedDeliveryCell"
import { setLocRequest, setLocState } from "./__mocks__/LocContextMock";

jest.mock("./LocContext");

describe("RestrictedDeliveryCell", () => {

    it("renders", () => {
        const hash = "some-hash";
        setLocRequest({
            files: [{
                hash,
                name: "File name",
                nature: "Some nature",
                published: false,
                restrictedDelivery: false,
                submitter: DEFAULT_ADDRESS,
            }]
        } as unknown as LocData);
        const result = shallowRender(<RestrictedDeliveryCell hash={hash}/>);
        expect(result).toMatchSnapshot();
    });

    it("asks confirmation on authorization", () => testConfirm(false));
    it("asks confirmation on cancellation", () => testConfirm(true));

    it("does nothing on cancelled authorization", () => testDoesNothing(false));
    it("does nothing on cancelled cancellation", () => testDoesNothing(true));
});

const hash = "some-hash";

const expectedEndpoint = "/api/collection/b0944596-264d-4ebe-89e7-ab5562cbeff8/files/some-hash";

function renderGivenFile(restrictedDelivery: boolean) {
    const locData = {
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
    setLocRequest(locData);
    const put = jest.fn();
    const axios = { put };
    const client = {
        legalOfficers: [],
        buildAxios: () => axios,
    };
    setLocState({
        locsState: () => ({ client }),
        data: () => locData,
        refresh: () => {},
    });
    render(<RestrictedDeliveryCell hash={hash}/>);
    return put;
}

async function testConfirm(restrictedDelivery: boolean) {
    const put = renderGivenFile(restrictedDelivery);

    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);
    await clickByName("Confirm");

    expect(put).toBeCalledWith(expectedEndpoint, expect.objectContaining({
        restrictedDelivery: !restrictedDelivery,
    }));
}

async function testDoesNothing(restrictedDelivery: boolean) {
    const put = renderGivenFile(restrictedDelivery);

    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);
    await clickByName("Cancel");

    expect(put).not.toBeCalled();
}
