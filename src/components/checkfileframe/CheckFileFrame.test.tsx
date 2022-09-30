import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setExpectedHash } from "src/common/__mocks__/HashMock";

import { shallowRender } from "src/tests";
import CheckFileFrame from "./CheckFileFrame";

jest.mock("src/common/hash");

describe("CheckFileFrame", () => {

    it("renders no match", () => {
        const checkHash = jest.fn();
        const checkResult = "NONE";
        const element = shallowRender(<CheckFileFrame
            checkHash={ checkHash }
            checkResult={ checkResult }
        />);
        expect(element).toMatchSnapshot();
    })

    it("calls checkHash and renders POSITIVE", async () => {
        const checkHash = jest.fn();
        setExpectedHash("9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08");
        render(<CheckFileFrame
            checkHash={ checkHash }
            checkResult="POSITIVE"
        />);
        const upload = screen.getByTestId("FileSelectorButtonHiddenInput");
        await userEvent.upload(upload, new File(["test"], "some-file.txt"));
        expect(checkHash).toBeCalledWith("0x9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08");
        expect(screen.getByText("positive")).toBeVisible();
    })

    it("calls checkHash and renders NEGATIVE", async () => {
        const checkHash = jest.fn();
        setExpectedHash("9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08");
        render(<CheckFileFrame
            checkHash={ checkHash }
            checkResult="NEGATIVE"
        />);
        const upload = screen.getByTestId("FileSelectorButtonHiddenInput");
        await userEvent.upload(upload, new File(["test"], "some-file.txt"));
        expect(checkHash).toBeCalledWith("0x9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08");
        expect(screen.getByText("negative")).toBeVisible();
    })
})
