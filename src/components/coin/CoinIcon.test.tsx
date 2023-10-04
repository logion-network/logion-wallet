import { render } from "src/tests";
import CoinIcon from "./CoinIcon";

describe("CoinIcon", () => {

    it("renders DOT", () => expectMatchSnapshot("dot"));
    it("renders LGNT", () => expectMatchSnapshot("lgnt"));
});

function expectMatchSnapshot(coindId: string) {
    const element = render(<CoinIcon coinId={ coindId } height="32px" />);
    expect(element).toMatchSnapshot();
}
