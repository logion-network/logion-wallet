jest.mock("../common/CommonContext");
jest.mock("../logion-chain");

import { findByTestId, getByTestId } from '@testing-library/react';
import CollectionLocItemChecker from "./CollectionLocItemChecker";
import { UUID } from "../logion-chain/UUID";
import { clickByName, render } from "../tests";
import { act } from "react-dom/test-utils";
import ReactDOM from "react-dom";

fdescribe("CollectionLocItemChecker", () => {

    it("renders", () => {
        const locId: UUID = new UUID("d97c99fd-9bcc-4f92-b9ea-b6be93abbbcd")
        const result = render(<CollectionLocItemChecker locId={ locId } />);
        expect(result).toMatchSnapshot();
    })

    it("clicks on Check data", async () => {

        const container = document.createElement('div');
        document.body.appendChild(container);

        const locId: UUID = new UUID("d97c99fd-9bcc-4f92-b9ea-b6be93abbbcd")
        ReactDOM.render(<CollectionLocItemChecker locId={ locId } />, container);

        await act(async () => {
            await clickByName("Check data");
        })
        expect(await getByTestId(container, "feedback-POSITIVE")).toBeDefined()
        expect(() => getByTestId(container, "feedback-NEGATIVE")).toThrowError()
        expect(() => getByTestId(container, "feedback-NONE")).toThrowError()
    })
})
