import { join, resolve } from "path";
import { keyStore, identityName, channel, chaincode, networkProfile, identityOrg } from './env';
import * as fs from 'fs';
import { FabricControllerAdapter } from '@worldsibu/convector-adapter-fabric';
import { ClientFactory } from '@worldsibu/convector-core';

import { UserController } from 'user-cc';
import { FileController } from 'file-cc';

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

const contextPath = join(keyStore + '/' + identityName);
fs.readFile(contextPath, 'utf8', (err) => {
    if (err) {
        throw new Error(`Context in ${contextPath} doesn't exist. Make sure that path resolves to your key stores folder`);
    } else {
        console.log('Context path with cryptographic materials exists');
    }
});

//#region Optional

/**
 * Check if the identity has been initialized in the chaincode.
 */
export async function InitServerIdentity() {
    await init;
    const user: string = "user1";
    await FabricAdapter.useUser(user);
    console.log(FabricAdapter.organizations, FabricAdapter.config);
    UserControllerBackEnd = UserControllerBackEnd.$withUser("admin");
    FileControllerBackEnd = FileControllerBackEnd.$withUser(user);
}

//#endregion
