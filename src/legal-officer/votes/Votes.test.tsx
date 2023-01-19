import { shallowRender } from "src/tests";
import Votes from "./Votes";

jest.mock("../LegalOfficerContext");

describe("Votes", () => {

    it("renders votes", () => {
        const result = shallowRender(<Votes/>);
        expect(result).toMatchSnapshot();
    });
});
