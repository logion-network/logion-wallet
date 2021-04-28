import { ReactElement } from 'react';
import { createRenderer } from 'react-test-renderer/shallow';
import renderer, { ReactTestRendererJSON } from 'react-test-renderer';

export function render(element: ReactElement): null | ReactTestRendererJSON | ReactTestRendererJSON[] {
    const component = renderer.create(element);
    return component.toJSON();
}


export function shallowRender<E extends ReactElement>(element: ReactElement): E {
    const renderer = createRenderer();
    renderer.render(element);
    return renderer.getRenderOutput();
}

export function mockAccount(address: string, name: string) {
    return {
        address,
        meta: {
            name
        }
    };
}
