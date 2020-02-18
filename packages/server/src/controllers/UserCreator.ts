import * as Fabric_CA_Client from "fabric-ca-client";
import * as Fabric_Client from "fabric-client";

export async function CreateUser(userName: string, organisation: string, client: Fabric_Client, attrs: Fabric_CA_Client.IKeyValueAttribute[]) {

    const ca_client = client.getCertificateAuthority();

    // first check to see if the admin is already enrolled
    const admin_user = await client.getUserContext('admin', true);

    if (!(admin_user && admin_user.isEnrolled()))
        throw new Error('Failed to get admin');

    console.log('Successfully loaded admin from persistence');

    // at this point we should have the admin user
    // first need to register the user with the CA server
    const secret = await ca_client.register({ enrollmentID: userName, attrs: attrs, role: 'client', affiliation: organisation }, admin_user);
    console.log(attrs, userName);
    // next we need to enroll the user with CA server
    console.log('Successfully registered', userName, '- secret:' + secret);

    const enrollment = await ca_client.enroll({ enrollmentID: userName, enrollmentSecret: secret });
    console.log('Successfully enrolled member user ', userName);
    const user = await client.createUser({
        username: userName,
        skipPersistence: true,
        mspid: organisation + "MSP",
        cryptoContent: { privateKeyPEM: enrollment.key.toBytes(), signedCertPEM: enrollment.certificate }
    });

    await client.setUserContext(user);
    console.log(userName, 'was successfully registered and enrolled and is ready to interact with the fabric network');
}
