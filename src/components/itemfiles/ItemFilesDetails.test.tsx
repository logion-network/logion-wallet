import { shallowRender } from "src/tests";
import ItemFileDetails from "./ItemFileDetails";

describe("ItemFilesDetails", () => {

    it("renders without deliveries", () => {
        const result = shallowRender(<ItemFileDetails
            deliveries={ [] }
        />);
        expect(result).toMatchSnapshot();
    })

    it("renders with deliveries", () => {
        const result = shallowRender(<ItemFileDetails
            deliveries={ [{
                copyHash: "0x72685ddcbec5052f9db2523252407990c24bb94d43b478d1a22411e612f3b650",
                owner: "0x900edc98db53508e6742723988b872dd08cd09c2",
                generatedOn: "2022-08-25T07:27:46.128Z",
                belongsToCurrentOwner: true,
            }] }
        />);
        expect(result).toMatchSnapshot();
    })
});
