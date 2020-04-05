import * as multer from "multer";
import * as fs from 'fs';

const IpfsClient = require('ipfs-api');
import { createHash } from 'crypto';
import { UploadDirectory } from './env';
import { Duplex } from 'stream';
import * as express from 'express';

export const MulterStorage = multer.diskStorage({
    destination(req: any, file: any, cb: any) {
        cb(null, UploadDirectory);
    },
    filename(req: any, file: any, cb: any) {
        cb(null, `${Date.now()}.${file.mimetype.split('/')[1]}`);
    },
});

export namespace File {
    export function DirectoryCreate(location: string) {
        // If Directory exists, exception thrown
        try {
            fs.mkdirSync(location, { recursive: true });
        } catch (ex) {
        }
    }
    export function Read(fileName: string) {
        return new Promise<Buffer>((resolve, reject) => {
            return fs.readFile(fileName, (err, data) => {
                if (err)
                    reject(err);
                else
                    resolve(data);
            });
        });
    }
    export function Delete(fileName: string) {
        return new Promise<void>((resolve, reject) => {
            return fs.unlink(fileName, (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }

    export function GetSHA256(fileName: string) {
        return new Promise<string>((resolve, reject) => {
            const hash = createHash("sha256");
            const rs = fs.createReadStream(fileName);
            rs.on("error", reject);
            rs.on("data", chunk => hash.update(chunk));
            rs.on("end", () => resolve(hash.digest("hex")));
        });
    }
}
import * as NodeVaultUserPass from "node-vault-user-pass";
export namespace Auth {
    export const AccessAuth = new NodeVaultUserPass.VaultAccess({
        Authority: ["create", "read", "update", "delete", "list", "sudo"],
        Path: 'path',
        Policy: 'auth_policy',
        EndPoint: 'http://localhost:8200',
        UserName: "username",
        SecretMountPoint: 'secret_zone',
        // Either Set this in Command Line as an Environment Variable
        // Use set VAULT_TOKEN or export VAULT_TOKEN depending
        // upon your OS
        // Or Provide it as String Here
        // This must be a Root Token
        // Or a token with substantial access
        Token: String("myroot"),
        // Yet to be Implemented
        CertificateMountPoint: "certificate"
    });
    export async function SetUp() {
        return await AccessAuth.Setup();
    }
    export async function SignIn(password: string, userName: string) {
        console.log(await AccessAuth.UsersGet());
        return await AccessAuth.SignIn(password, userName);
    }
    export async function SignUp(password: string, userName: string, data: any) {
        AccessAuth.AdminMode();
        await AccessAuth.SignUp(password, userName);
        await SignIn(password, userName);
        for (const kv of data)
            await AccessAuth.Write(kv.name, kv.value);
        AccessAuth.AdminMode();
    }
    export async function SignOut() {
    }
}

export namespace IPFS {
    const IPFSMiddleMan = IpfsClient({ host: 'localhost', port: '5001', protocol: 'http' });

    export async function AddFile(fileName: string) {
        const data = await File.Read(fileName);
        const files: any = await AddByData(IPFSMiddleMan, data);
        return String(files[0].hash);
    }

    export async function GetFile(ipfsName: string) {
        const files = await IPFSMiddleMan.get(ipfsName);
        return (files[0].content as Buffer);
    }

    function AddByData(ipfs: any, data: Buffer) {
        return new Promise((resolve, reject) => {
            return ipfs.add(data, (err: any, files: any) => {
                if (files) {
                    resolve(files);
                } else {
                    reject(err);
                }
            });
        });
    }

    function BufferToStream(buffer: Buffer) {
        const stream = new Duplex();
        stream.push(buffer);
        stream.push(null);
        return stream;
    }
    export function Download(res: express.Response, buffer: Buffer) {
        return new Promise<void>((resolve, reject) => {
            return BufferToStream(buffer)
                .pipe(res)
                .on('error', (error: any) => {
                    res.sendStatus(404);
                    resolve();
                })
                .on('finish', function () {
                    resolve()
                })
                .on('end', function () {
                    resolve()
                });
        });
    }
}

export function ToArray(element: any | Array<any> | null) {
    if (element == null)
        return [];
    if (element instanceof Array)
        return element;
    else
        return [element];
}