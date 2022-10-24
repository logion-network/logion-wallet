import { shallowRender } from "../../tests";
import CreativeCommonsIcon from "./CreativeCommonsIcon";

describe("CreativeCommonsIcon", () => {

    it("renders", () => {
        const element = shallowRender(<CreativeCommonsIcon code="BY-NC"/>);
        expect(element).toMatchSnapshot();
    })
})
