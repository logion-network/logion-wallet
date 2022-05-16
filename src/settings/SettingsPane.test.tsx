import { shallowRender } from '../tests';
import SettingsPane from './SettingsPane';

jest.mock("../logion-chain");
jest.mock("../version/VersionContext");

describe("SettingsPane", () => {

    it("renders for user", () => {
        const result = shallowRender(<SettingsPane showContactInformation={ false } />);
        expect(result).toMatchSnapshot();
    })

    it("renders for legal officer", () => {
        const result = shallowRender(<SettingsPane showContactInformation={ true } />);
        expect(result).toMatchSnapshot();
    })
})
