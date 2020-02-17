import * as multer from "multer";
import * as path from "path";
import * as fs from 'fs';

const IpfsClient = require('ipfs-api');
import { createHash } from 'crypto';
import { UploadDirectory } from './env';
import { Duplex } from 'stream';


export const MulterStorage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, UploadDirectory);
    },
    filename(req, file, cb) {
        cb(null, `${Date.now()}.${file.mimetype.split('/')[1]}`);
    },
});

const IPFSMiddleMan = IpfsClient({ host: 'localhost', port: '5001', protocol: 'http' });

export async function IPFSAddFile(fileName: string) {
    const data = await FileRead(fileName);
    const files = await IPFSAddByData(IPFSMiddleMan, data);
    return files;
}
export function DirectoryCreate(location: string) {
    // If Directory exists, exception thrown
    try {
        fs.mkdirSync(location, { recursive: true });
    } catch (ex) {
    }
}
export function FileRead(fileName: string) {
    return new Promise<Buffer>((resolve, reject) => {
        return fs.readFile(fileName, (err, data) => {
            if (err)
                reject(err);
            else
                resolve(data);
        });
    });
}
export function FileDelete(fileName: string) {
    return new Promise<void>((resolve, reject) => {
        return fs.unlink(fileName, (err) => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}

export function GetSHA256FromFile(fileName: string) {
    return new Promise<string>((resolve, reject) => {
        const hash = createHash("sha256");
        const rs = fs.createReadStream(fileName);
        rs.on("error", reject);
        rs.on("data", chunk => hash.update(chunk));
        rs.on("end", () => resolve(hash.digest("hex")));
    });
}

export async function IPFSStreamFile(ipfsName: string) {
    const files = await IPFSMiddleMan.get(ipfsName);
    return (files[0].content as Buffer);
}

function IPFSAddByData(ipfs: any, data: Buffer) {
    return new Promise((resolve, reject) => {
        return ipfs.add(data, (err, files) => {
            if (files) {
                resolve(files);
            } else {
                reject(err);
            }
        });
    });
}
export function bufferToStream(buffer: Buffer) {
    let stream = new Duplex();
    stream.push(buffer);
    stream.push(null);
    return stream;
}