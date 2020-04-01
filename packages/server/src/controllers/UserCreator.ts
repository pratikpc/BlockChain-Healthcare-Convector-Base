import { IKeyValueAttribute } from "fabric-ca-client";
import * as Fabric_Client from "fabric-client";

export async function CreateUser(userName: string, organisation: string, client: Fabric_Client, attrs: IKeyValueAttribute[]) {
    // first check to see if the admin is already enrolled
    const admin_user = await client.getUserContext('admin', true);

    if (!(admin_user && admin_user.isEnrolled()))
        throw new Error('Failed to get admin');

    const ca_client = client.getCertificateAuthority();
    // at this point we should have the admin user
    // first need to register the user with the CA server
    const secret = await ca_client.register({ enrollmentID: userName, attrs: attrs, role: 'client', affiliation: organisation }, admin_user);
    // next we need to enroll the user with CA server
    const enrollment = await ca_client.enroll({ enrollmentID: userName, enrollmentSecret: secret });
    // Create the Given User
    const user = await client.createUser({
        username: userName,
        skipPersistence: true,
        mspid: organisation + "MSP",
        cryptoContent: { privateKeyPEM: enrollment.key.toBytes(), signedCertPEM: enrollment.certificate }
    });

    return await client.setUserContext(user);
}
