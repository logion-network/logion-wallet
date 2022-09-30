import { shallowRender } from "src/tests"
import ItemImporter from "./ItemImporter"

describe("ItemImporter", () => {

    it("renders", () => {
        const element = shallowRender(<ItemImporter />);
        expect(element).toMatchSnapshot();
    })
})
