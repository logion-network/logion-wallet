import { LocData } from "@logion/client";
import { UUID } from "@logion/node-api";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosResponse } from "axios";
import { It } from "moq.ts";
import { axiosMock, resetAxiosMock } from "src/logion-chain/__mocks__/LogionChainMock";

import { clickByName, shallowRender } from "src/tests";
import { setLocId, setLocRequest } from "../__mocks__/LocContextMock";
import ArchiveButton from "./ArchiveButton";

jest.mock("../LocContext");
jest.mock("../../logion-chain");

describe("ArchiveButton", () => {

    it("renders empty without data", () => {
        setLocRequest(null);
        const element = shallowRender(<ArchiveButton />);
        expect(element).toMatchSnapshot();
    })

    it("renders button with data", () => {
        givenLocReadyForDownload();
        const element = shallowRender(<ArchiveButton />);
        expect(element).toMatchSnapshot();
    })

    it("downloads files on confirm", async () => {
        givenLocReadyForDownload();

        await renderAndAgree(true);
        await clickByName("Download");

        expect(window.URL.createObjectURL).toBeCalled();
    })

    it("does not download files on cancel", async () => {
        givenLocReadyForDownload();

        await renderAndAgree(true);
        await clickByName("Cancel");

        expect(window.URL.createObjectURL).not.toBeCalled();
    })

    it("does not download files if did not agree", async () => {
        givenLocReadyForDownload();

        await renderAndAgree(false);
        await clickByName("Download");

        expect(window.URL.createObjectURL).not.toBeCalled();
    })
})

function givenLocReadyForDownload() {
    const locId = new UUID("8c30c432-793d-4671-8b2c-74446fd90cc0");
    setLocId(locId);
    setLocRequest({
        id: locId,
    } as unknown as LocData);
    resetAxiosMock();
    axiosMock.setup(instance => instance.get(
        `/api/loc-request/${ locId }`,
        It.Is<{responseType: string}>(options => options.responseType === "blob"))
    ).returnsAsync({
        headers: {
            "content-type": "application/json",
        }
    } as unknown as AxiosResponse);
    window.URL.createObjectURL = jest.fn().mockReturnValue("data:application/json,{}");
}

async function renderAndAgree(agree: boolean) {
    render(<ArchiveButton />);
    await clickByName(content => /Local Backup/.test(content));
    if(agree) {
        let checkbox = screen.getByRole("checkbox");
        await userEvent.click(checkbox);
    }
}
