import * as express from 'express';
import { FileControllerBackEnd } from '../convector';
import { MulterStorage, GetSHA256FromFile, IPFSAddFile, FileDelete, IPFSStreamFile, bufferToStream } from "../utils"
import * as multer from "multer";
import * as uuid from "uuid";
import * as path from "path";

const Upload = multer({ storage: MulterStorage });

export const FileExpressController = express.Router();

FileExpressController.get("/upload", (req, res) => {
    console.log("3334");
    return res.render("upload.hbs");
});

// Upload File
FileExpressController.post('/upload', Upload.single('file'), async (req, res) => {
    const fileName = req.file.path;

    async function AddFileToBlockchain(fileName: string) {
        const files = await IPFSAddFile(fileName);
        const id = uuid();
        const ipfs = String(files[0].hash);
        const hash = await GetSHA256FromFile(fileName);
        const ext = path.extname(fileName);
        const patient = ["1"];
        const clinician = ["1"];
        const doctor = ["1"];
        await FileControllerBackEnd.Create(id, ipfs, hash, ext, patient, clinician, doctor);
        await FileDelete(fileName);
    }
    await AddFileToBlockchain(fileName);
    return res.redirect("/upload");
});

FileExpressController.get('/', async (req: express.Request, res: express.Response) => {
    const files = await FileControllerBackEnd.GetAll();
    return res.json(files);
});

export function Download(res: any, buffer: any) {
    return new Promise<void>((resolve, reject) => {
        return bufferToStream(buffer)
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
FileExpressController.get('/:id', async (req: express.Request, res: express.Response) => {
    let { id } = req.params;
    const file = await FileControllerBackEnd.GetDownloadLink(id);

    res.contentType(String(file.extension));
    const buffer = await IPFSStreamFile(String(file.IPFS));
    await Download(res, buffer);
});