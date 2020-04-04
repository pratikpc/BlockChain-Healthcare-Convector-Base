import { join, resolve } from "path";
import { keyStore, identityName, channel, chaincode, networkProfile, identityOrg } from './env';
import * as fs from 'fs';
import { FabricControllerAdapter } from '@worldsibu/convector-adapter-fabric';
import { ClientFactory } from '@worldsibu/convector-core';

import { UserController, FileController } from 'file-cc';

export const FabricAdapter = new FabricControllerAdapter({
    txTimeout: 300000,
    user: identityName,
    channel: channel,
    chaincode: chaincode,
    keyStore: keyStore,
    networkProfile: networkProfile
});

const init = FabricAdapter.init();
export let UserControllerBackEnd = ClientFactory(UserController, FabricAdapter);
export let FileControllerBackEnd = ClientFactory(FileController, FabricAdapter);

function CheckIfCryptoMaterialExists() {
    const contextPath = join(keyStore + '/' + identityName);
    try {
        const exists = fs.existsSync(contextPath);
        if (exists) {
            console.log('Context path with cryptographic materials exists');
            return;
        }
    } catch (err) {
    }
    throw new Error(`Context in ${contextPath} doesn't exist. Make sure that path resolves to your key stores folder`);
}


//#region Optional

/**
 * Check if the identity has been initialized in the chaincode.
 */
export async function SignIn(user: string) {
    await FabricAdapter.useUser(user);
    UserControllerBackEnd = UserControllerBackEnd.$withUser(user);
    FileControllerBackEnd = FileControllerBackEnd.$withUser(user);
}
export async function SignOut(user: string = "user1") {
    await FabricAdapter.useUser(user);
    UserControllerBackEnd = UserControllerBackEnd.$withUser(user);
    FileControllerBackEnd = FileControllerBackEnd.$withUser(user);
}
export async function InitServerIdentity() {
    await CheckIfCryptoMaterialExists();

    await init;

    await SignIn("user1");
    UserControllerBackEnd = UserControllerBackEnd.$withUser("admin");

    // if a GENESIS User doesn't exist for Default User
    // Create one
    try {
        await UserControllerBackEnd.Generate();
    } catch (err) { }
}

//#endregion
