import { shallowRender } from "src/tests";
import ViewCertificateButton from "./ViewCertificateButton";

describe("ViewCertificateButton", () => {

    it("renders", () => {
        const element = shallowRender(<ViewCertificateButton url="https://certificate.logion.network/public/certificate/134441747622015457578768231713467035151"/>);
        expect(element).toMatchSnapshot();
    });
});
