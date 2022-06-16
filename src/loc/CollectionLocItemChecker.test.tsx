jest.mock("../common/CommonContext");
jest.mock("../logion-chain");
jest.unmock("@logion/node-api/dist/LogionLoc");

import { render } from "@testing-library/react";
import { UUID } from "@logion/node-api/dist/UUID";

import { LOCollectionLocItemChecker } from "./CollectionLocItemChecker";

describe("CollectionLocItemChecker", () => {

    it("renders", () => {
        const locId: UUID = new UUID("d97c99fd-9bcc-4f92-b9ea-b6be93abbbcd")
        const result = render(<LOCollectionLocItemChecker locId={ locId } />);
        expect(result).toMatchSnapshot();
    })
})
