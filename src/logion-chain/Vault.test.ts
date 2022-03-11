import { getVaultAddress } from "./Vault";
import { RecoveryConfig } from "./Recovery";
import { DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER } from "../common/TestData";

describe("Vault", () => {

    it("generates expected Vault address", ()=> {

        const recoveryConfig: RecoveryConfig = {
            legalOfficers: [ DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER ]
        }
        const vaultAddress = getVaultAddress("5H4MvAsobfZ6bBCDyj5dsrWYLrA8HrRzaqa9p61UXtxMhSCY", recoveryConfig)
        expect(vaultAddress).toEqual("5HDgYTbcXeXsWxDsdRVKVeBJRgUrq5fPVxRpNaVZYgHkvuzU")


    })
})
