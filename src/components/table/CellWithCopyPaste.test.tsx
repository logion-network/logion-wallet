import { shallowRender } from "src/tests";
import CellWithCopyPaste from "./CellWithCopyPaste";

describe("CellWithCopyPaste", () => {

    it("renders", () => {
        const result = shallowRender(<CellWithCopyPaste content="Some content" />);
        expect(result).toMatchSnapshot();
    })
});
