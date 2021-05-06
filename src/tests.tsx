import { ReactElement } from 'react';
import { createRenderer } from 'react-test-renderer/shallow';
import reactRenderer, { ReactTestRenderer, ReactTestRendererJSON, act as reactAct } from 'react-test-renderer';

export function render(element: ReactElement): null | ReactTestRendererJSON | ReactTestRendererJSON[] {
    const component = reactRenderer.create(element);
    return component.toJSON();
}

export function renderer(element: ReactElement): ReactTestRenderer {
    return reactRenderer.create(element);
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

export { reactAct as act };
