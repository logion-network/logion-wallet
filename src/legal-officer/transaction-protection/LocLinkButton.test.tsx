import LocLinkButton, { Visible } from "./LocLinkButton";
import { shallowRender } from "../../tests";

describe("LocLinkExistingForm", () => {

    it("renders", () => {
        const tree = shallowRender(<LocLinkButton />)
        expect(tree).toMatchSnapshot();
    })

    it("renders LINK_EXISTING", () => {
        const tree = shallowRender(<LocLinkButton visible={ Visible.LINK_EXISTING } />)
        expect(tree).toMatchSnapshot();
    })
})
