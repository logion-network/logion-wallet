jest.mock("../common/CommonContext");
jest.mock("../logion-chain");
jest.mock("src/legal-officer/LegalOfficerContext");
jest.unmock("@logion/node-api/dist/LogionLoc");

import { render } from "@testing-library/react";
import { UUID } from "@logion/node-api/dist/UUID";

import { LOCollectionLocItemChecker } from "./CollectionLocItemChecker";
import { DEFAULT_LEGAL_OFFICER } from "src/common/TestData";

describe("CollectionLocItemChecker", () => {

    it("renders", () => {
        const locId: UUID = new UUID("d97c99fd-9bcc-4f92-b9ea-b6be93abbbcd")
        const result = render(<LOCollectionLocItemChecker locId={ locId } locOwner={ DEFAULT_LEGAL_OFFICER } />);
        expect(result).toMatchSnapshot();
    })
})
