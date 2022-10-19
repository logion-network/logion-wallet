import { setViewer } from "src/common/__mocks__/CommonContextMock";
import { shallowRender } from "src/tests"
import LegalEntity from "./LegalEntity";

jest.mock("../../common/CommonContext");

describe("LegalEntity", () => {

    it("renders empty", () => {
        const element = shallowRender(<LegalEntity />);
        expect(element).toMatchSnapshot();
    })

    it("renders legal entity name for user", () => {
        setViewer("User");
        const element = shallowRender(<LegalEntity company="My company" />);
        expect(element).toMatchSnapshot();
    })

    it("renders legal entity name for LLO", () => {
        setViewer("LegalOfficer");
        const element = shallowRender(<LegalEntity company="My company" />);
        expect(element).toMatchSnapshot();
    })
})
