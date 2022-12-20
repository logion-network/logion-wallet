import { LogionClassification as LogionClassificationClass } from "@logion/client/dist/license/LogionClassification.js";
import { UUID } from "@logion/node-api";

import { shallowRender } from "src/tests";
import LogionClassification from "./LogionClassification";

describe("LogionClassification", () => {

    it("renders classification", () => {
        const licenseLocId = new UUID("c24ec512-f72b-49a5-8365-68fc5ad2d973");
        const logionClassification = new LogionClassificationClass(licenseLocId, {
            transferredRights: [ "PER-PRIV", "TIME", "REG" ],
            regionalLimit: [ "BE" ],
            expiration: "2023-01-01",
        });
        const element = shallowRender(<LogionClassification logionClassification={ logionClassification } />);
        expect(element).toMatchSnapshot();
    })
})
