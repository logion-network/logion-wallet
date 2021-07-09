let pairs: Record<string, any> = {
    lockedSigner: {
        isLocked: true,
    },
    regularSigner: {
        isLocked: false,
    },
};

let _loadAllFails = false;

const keyring = {

    loadAll: () => {
        if(_loadAllFails) {
            throw "error";
        }
    },

    getPair: (signerId: string): any => {
        return pairs[signerId];
    },
};

export default keyring;

export function loadAllFails(value: boolean) {
    _loadAllFails = value;
}

export function teardown() {
    _loadAllFails = false;
}
