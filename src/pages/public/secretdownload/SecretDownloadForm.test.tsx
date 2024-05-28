import { shallowRender } from "src/tests";
import SecretDownloadForm from "./SecretDownloadForm";
import { COLOR_THEME } from "src/common/TestData";

describe("SecretDownloadForm", () => {

    it("renders", () => {
        const element = shallowRender(<SecretDownloadForm
            challenge="Challenge"
            colors={ COLOR_THEME.frame }
            locId="e32e6e8c-e632-4afd-afcf-ea67fc99153b"
            requestId="e5b0f5bb-ae97-41b0-8452-542dd80ca0bb"
        />);
        expect(element).toMatchSnapshot();
    });
});
