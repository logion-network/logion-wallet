import { CollectionItem } from "@logion/client";

import { shallowRender } from "src/tests";
import TermsAndConditions from "./TermsAndConditions";

describe("TermsAndConditions", () => {

    it("renders with item", () => {
        const item = {

        } as unknown as CollectionItem;
        const element = shallowRender(<TermsAndConditions item={ item } />);
        expect(element).toMatchSnapshot();
    })
})
