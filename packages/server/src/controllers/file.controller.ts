import * as express from 'express';
import { FileControllerBackEnd } from '../convector';
import { MulterStorage, File, IPFS, } from "../utils"
import * as multer from "multer";
import * as uuid from "uuid";
import * as path from "path";

export const FileExpressController = express.Router();

FileExpressController.get("/upload", (req: express.Request, res: express.Response) => {
    return res.render("upload.hbs");
});

const Upload = multer({ storage: MulterStorage });
// Upload File
FileExpressController.post('/upload', Upload.single('file'), async (req: express.Request, res: express.Response) => {
    const fileName = req.file.path;

    async function AddFileToBlockchain(fileName: string) {
        // In Future, this ID must be Linked with DB
        const id = uuid();
        const ipfs = await IPFS.AddFile(fileName);
        const hash = await File.GetSHA256(fileName);
        const ext = path.extname(fileName);

        // TODO:- Shift to Recipient ID
        const recipient = ["1"];
        // TODO:- Shift to Current User ID
        const uploader = ["1"];
        // TODO:- Shift to Viewer ID
        const viewer = ["1"];

        await FileControllerBackEnd.Create(id, ipfs, hash, ext, recipient, uploader, viewer);
        await File.Delete(fileName);
    }
    await AddFileToBlockchain(fileName);
    return res.redirect("/file/upload");
});

FileExpressController.post('/comment', async (req: express.Request, res: express.Response) => {
    const params = req.body;

    if (params == null)
        return res.sendStatus(404);

    const id = String(params.id).trim();
    const comment = String(params.comment).trim();
    const description = String(params.description).trim();
    // TODO:- Shift to Current User ID
    const creatorId = "1";

    if (id === "" || comment === "" || description === "")
        return res.sendStatus(404);

    await FileControllerBackEnd.AddDescriptionToFile(id, comment, description);
    return res.redirect("/file/upload");
});

FileExpressController.get('/', async (req: express.Request, res: express.Response) => {
    const files = await FileControllerBackEnd.GetAll();
    return res.json(files);
});

FileExpressController.get('/:id/comments', async (req: express.Request, res: express.Response) => {
    const id = String(req.params.id).trim();

    if (id === "")
        return res.sendStatus(404);

    const comments = await FileControllerBackEnd.GetComments(id);
    return res.json(comments);
});

FileExpressController.get('/:id', async (req: express.Request, res: express.Response) => {
    let { id } = req.params;
    try {
        const file = await FileControllerBackEnd.GetDownloadLink(id);

        res.contentType(String(file.extension));
        const buffer = await IPFS.GetFile(String(file.IPFS));
        await IPFS.Download(res, buffer);
    } catch(err){
        console.error(err);
        return res.sendStatus(404);
    }
});

