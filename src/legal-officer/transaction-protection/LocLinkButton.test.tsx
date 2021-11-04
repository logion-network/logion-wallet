jest.mock("./LocContext");

import LocLinkButton, { Visible } from "./LocLinkButton";
import { shallowRender } from "../../tests";

describe("LocLinkButton", () => {

    it("renders", () => {
        const tree = shallowRender(<LocLinkButton />)
        expect(tree).toMatchSnapshot();
    })

    it("renders LINK_EXISTING", () => {
        const tree = shallowRender(<LocLinkButton visible={ Visible.LINK_EXISTING } />)
        expect(tree).toMatchSnapshot();
    })

    it("renders LINK_NEW_IDENTITY", () => {
        const tree = shallowRender(<LocLinkButton visible={ Visible.LINK_NEW_IDENTITY } />)
        expect(tree).toMatchSnapshot();
    })

    it("renders LINK_NEW_TRANSACTION", () => {
        const tree = shallowRender(<LocLinkButton visible={ Visible.LINK_NEW_TRANSACTION } />)
        expect(tree).toMatchSnapshot();
    })
})
