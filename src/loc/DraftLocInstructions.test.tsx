import { shallowRender } from "src/tests"
import DraftLocInstructions from "./DraftLocInstructions"

describe("DraftLocInstructions", () => {

    it("renders", () => {
        const element = shallowRender(<DraftLocInstructions/>);
        expect(element).toMatchSnapshot();
    })
})
