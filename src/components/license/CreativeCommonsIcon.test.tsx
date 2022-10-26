import { shallowRender } from "../../tests";
import CreativeCommonsIcon from "./CreativeCommonsIcon";
import { CreativeCommons } from "@logion/client/dist/license/CreativeCommons";
import { UUID } from "@logion/node-api";

describe("CreativeCommonsIcon", () => {

    it("renders", () => {
        const creativeCommons = new CreativeCommons(new UUID("28e68ed4-531a-4bb5-a54e-6283bb853e82"), "BY-NC");
        const element = shallowRender(<CreativeCommonsIcon creativeCommons={ creativeCommons }/>);
        expect(element).toMatchSnapshot();
    })
})
