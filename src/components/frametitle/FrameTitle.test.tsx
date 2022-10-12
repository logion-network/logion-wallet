import { shallowRender } from "src/tests";

import FrameTitle from "./FrameTitle";

describe("FrameTitle", () => {

    it("renders without icon", () => {
        const element = shallowRender(<FrameTitle text="My Title" />);
        expect(element).toMatchSnapshot();
    });

    it("renders with icon", () => {
        const element = shallowRender(<FrameTitle text="My Title" iconId="ok" />);
        expect(element).toMatchSnapshot();
    });
});
