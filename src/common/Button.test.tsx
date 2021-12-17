import { shallowRender } from '../tests';
import Button from './Button';

test("renders", () => {
    const result = shallowRender(<Button
        action={{
            id: "button",
            buttonText: "Text",
            callback: jest.fn(),
            buttonVariant: 'primary',
        }}
    />);
    expect(result).toMatchSnapshot();
});
