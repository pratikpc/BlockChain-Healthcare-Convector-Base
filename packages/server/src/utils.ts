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

const IPFSMiddleMan = IpfsClient({ host: 'localhost', port: '5001', protocol: 'http' });

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

export namespace IPFS {
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

export function ToArray(element: any | Array<any>) {
    if (element instanceof Array)
        return element;
    else
        return [element];
}