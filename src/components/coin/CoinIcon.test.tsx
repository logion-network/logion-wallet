import { render } from "src/tests";
import CoinIcon from "./CoinIcon";

describe("CoinIcon", () => {

    it("renders LGNT", () => expectMatchSnapshot());
});

function expectMatchSnapshot() {
    const element = render(<CoinIcon height="32px" />);
    expect(element).toMatchSnapshot();
}
