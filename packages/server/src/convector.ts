import { join, resolve } from "path";
import { keyStore, identityName, channel, chaincode, networkProfile } from './env';
import * as fs from 'fs';
import { FabricControllerAdapter } from '@worldsibu/convector-adapter-fabric';
import { ClientFactory } from '@worldsibu/convector-core';

import { ParticipantController } from 'participant-cc';
import { PersonController } from 'person-cc';

const adapter = new FabricControllerAdapter({
    txTimeout: 300000,
    user: identityName,
    channel,
    chaincode,
    keyStore: resolve(__dirname, keyStore),
    networkProfile: resolve(__dirname, networkProfile)
    // userMspPath: keyStore
});

const initAdapter = adapter.init();
export const ParticipantControllerBackEnd = ClientFactory(ParticipantController, adapter);
export const PersonControllerBackEnd = ClientFactory(PersonController, adapter);


const contextPath = join(keyStore + '/' + identityName);
fs.readFile(contextPath, 'utf8', async function (err) {
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
    await initAdapter;
}

//#endregion