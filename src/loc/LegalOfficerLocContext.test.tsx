import { UUID } from "@logion/node-api";
import { shallowRender } from "src/tests"
import { LegalOfficerLocContextProvider, useLegalOfficerLocContext } from "./LegalOfficerLocContext";
import { useLocContext } from "./LocContext";

jest.mock("../legal-officer/LegalOfficerContext");

describe("LegalOfficerLocContextProvider", () => {

    it("renders", () => {
        const element = shallowRender(<LegalOfficerLocContextProvider
            locId={ locId }
            backPath="/"
            detailsPath={ () => "" }
        >
            <p>Some content</p>
        </LegalOfficerLocContextProvider>);
        expect(element).toMatchSnapshot();
    })

    it("uses LOC context", () => {
        expect(useLegalOfficerLocContext).toBe(useLocContext);
    })
})

const locId = new UUID("274c1273-5d0e-4c81-bce4-a15518affd35");
