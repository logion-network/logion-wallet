import { UUID } from "@logion/node-api";
import { LogionClassification as LogionClassificationClass } from "@logion/client/dist/license/LogionClassification.js";

import { shallowRender } from "src/tests"
import LogionTerms from "./LogionTerms"

describe("LogionTerms", () => {

    it("renders single term", () => {
        const licenseLocId = new UUID("c24ec512-f72b-49a5-8365-68fc5ad2d973");
        const terms = new LogionClassificationClass(licenseLocId, {
            transferredRights: [ "PER-PRIV" ],
            regionalLimit: [],
        });
        const element = shallowRender(<LogionTerms terms={ terms } />);
        expect(element).toMatchSnapshot();
    })

    it("renders several terms", () => {
        const licenseLocId = new UUID("c24ec512-f72b-49a5-8365-68fc5ad2d973");
        const terms = new LogionClassificationClass(licenseLocId, {
            transferredRights: [ "PER-PRIV", "WW", "NOTIME" ],
            regionalLimit: [],
        });
        const element = shallowRender(<LogionTerms terms={ terms } />);
        expect(element).toMatchSnapshot();
    })

    it("renders regional use", () => {
        const licenseLocId = new UUID("c24ec512-f72b-49a5-8365-68fc5ad2d973");
        const terms = new LogionClassificationClass(licenseLocId, {
            transferredRights: [ "PER-PRIV", "REG" ],
            regionalLimit: [ "BE", "NL", "LU" ],
        });
        const element = shallowRender(<LogionTerms terms={ terms } />);
        expect(element).toMatchSnapshot();
    })

    it("renders limited period", () => {
        const licenseLocId = new UUID("c24ec512-f72b-49a5-8365-68fc5ad2d973");
        const terms = new LogionClassificationClass(licenseLocId, {
            transferredRights: [ "PER-PRIV", "TIME" ],
            regionalLimit: [],
            expiration: "2023-01-01",
        });
        const element = shallowRender(<LogionTerms terms={ terms } />);
        expect(element).toMatchSnapshot();
    })
})
