let params = {};

export let useParams = () => params;

export function setParams(mock: object) {
    params = mock;
}

export let history: any = {
    push: jest.fn(),
};

export let useHistory = () => history;

export function setHistory(mock: object) {
    history = mock;
}
