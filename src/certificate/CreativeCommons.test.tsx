import { shallowRender } from "../tests";
import CreativeCommons from "./CreativeCommons";
import { UUID } from "@logion/node-api";
import { CreativeCommons as CreativeCommonsType } from "@logion/client/dist/license/CreativeCommons";

describe("CreativeCommons", () => {

    it("renders", () => {
        const licenseLocId = new UUID("c24ec512-f72b-49a5-8365-68fc5ad2d973");
        const creativeCommons = CreativeCommonsType.fromDetails(licenseLocId, "BY-NC-SA");
        const element = shallowRender(<CreativeCommons creativeCommons={ creativeCommons } />)
        expect(element).toMatchSnapshot();
    })
})
