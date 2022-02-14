jest.mock("../common/CommonContext");
jest.mock("../logion-chain");

import CollectionLocItemChecker from "./CollectionLocItemChecker";
import { UUID } from "../logion-chain/UUID";
import { render } from "@testing-library/react";


describe("CollectionLocItemChecker", () => {

    it("renders", () => {
        const locId: UUID = new UUID("d97c99fd-9bcc-4f92-b9ea-b6be93abbbcd")
        const result = render(<CollectionLocItemChecker locId={ locId } />);
        expect(result).toMatchSnapshot();
    })
})
