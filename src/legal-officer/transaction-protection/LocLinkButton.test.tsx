jest.mock("./LocContext");

import LocLinkButton, { Visible } from "./LocLinkButton";
import { shallowRender } from "../../tests";

describe("LocLinkButton", () => {

    it("renders", () => {
        const tree = shallowRender(<LocLinkButton excludeNewIdentity={ false } />)
        expect(tree).toMatchSnapshot();
    })

    it("renders and excludes new identity", () => {
        const tree = shallowRender(<LocLinkButton excludeNewIdentity={ true } />)
        expect(tree).toMatchSnapshot();
    })

    it("renders LINK_EXISTING", () => {
        const tree = shallowRender(<LocLinkButton visible={ Visible.LINK_EXISTING } excludeNewIdentity={ false } />)
        expect(tree).toMatchSnapshot();
    })

    it("renders LINK_NEW_IDENTITY", () => {
        const tree = shallowRender(<LocLinkButton visible={ Visible.LINK_NEW_IDENTITY } excludeNewIdentity={ false } />)
        expect(tree).toMatchSnapshot();
    })

    it("renders LINK_NEW_TRANSACTION", () => {
        const tree = shallowRender(<LocLinkButton visible={ Visible.LINK_NEW_TRANSACTION }
                                                  excludeNewIdentity={ false } />)
        expect(tree).toMatchSnapshot();
    })
})
