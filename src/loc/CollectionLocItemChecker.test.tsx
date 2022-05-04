jest.mock("../common/CommonContext");
jest.mock("../logion-chain");
jest.unmock("logion-api/dist/LogionLoc");

import { render } from "@testing-library/react";
import { UUID } from "logion-api/dist/UUID";

import CollectionLocItemChecker from "./CollectionLocItemChecker";

describe("CollectionLocItemChecker", () => {

    it("renders", () => {
        const locId: UUID = new UUID("d97c99fd-9bcc-4f92-b9ea-b6be93abbbcd")
        const result = render(<CollectionLocItemChecker locId={ locId } viewer="User" />);
        expect(result).toMatchSnapshot();
    })
})
