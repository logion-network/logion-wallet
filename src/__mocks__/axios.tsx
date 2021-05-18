function mockResponse(data: any) {
    return {
        data
    };
}

const axios = {

    get: (url: string) => mockResponse({}),
    put: (url: string) => mockResponse({}),
    post: (url: string) => mockResponse({}),
};
export default axios;

export function mockPut(whenUrl: string, thenData: any, thenCall?: () => void) {
    axios.put = (url: string): any => {
        if(url === whenUrl) {
            if(thenCall !== undefined) {
                thenCall();
            }
            return mockResponse(thenData);
        }
    };
}

export function mockPost(whenUrl: string, thenData: any, thenCall?: () => void) {
    axios.post = (url: string): any => {
        if(url === whenUrl) {
            if(thenCall !== undefined) {
                thenCall();
            }
            return mockResponse(thenData);
        }
    };
}
