import * as express from 'express';
import { FileControllerBackEnd } from '../convector';
import { MulterStorage, File, IPFS, } from "../utils"
import * as multer from "multer";
import * as uuid from "uuid";
import * as path from "path";
import * as Utils from "../utils";

export const FileExpressController = express.Router();
async function AddFileToBlockchain(fileName: string, recipient: string[]) {
    // In Future, this ID must be Linked with DB
    const id = uuid();
    const ipfs = await IPFS.AddFile(fileName);
    const hash = await File.GetSHA256(fileName);
    const ext = path.extname(fileName);

    // TODO:- Shift to Current User ID
    const uploader: string[] = [];
    // TODO:- Shift to Viewer ID
    const viewer: string[] = [];

    await FileControllerBackEnd.Create(id, ipfs, hash, ext, recipient, uploader, viewer);
    await File.Delete(fileName);
}

const Upload = multer({ storage: MulterStorage });
// Upload File
FileExpressController.post('/create', Upload.array('file'), async (req: express.Request, res: express.Response) => {
    try {
        const files = req.files as Express.Multer.File[];
        if (files.length === 0 || req.body == null)
            throw new Error("Params Not Provided");
        const recipients = Utils.ToArray(req.body.recipientId);
        if (recipients.length === 0)
            throw new Error("Recipient Not Provided");

        const file_adder_promise: Array<Promise<void>> = [];
        for (const file of files)
            file_adder_promise.push(AddFileToBlockchain(file.path, recipients));
        await Promise.all(file_adder_promise);
        return res.sendStatus(200);
    } catch (err) {
        console.error(err);
    }
    return res.sendStatus(500);
});

FileExpressController.post('/:id/comment', async (req: express.Request, res: express.Response) => {
    const params = req.body;

    if (params == null)
        return res.sendStatus(404);

    try {
        const id = String(req.params.id).trim();
        const commentId = uuid();
        const comment = String(params.comment).trim();
        const description = String(params.description).trim();

        if (id === "" || comment === "" || description === "")
            return res.sendStatus(404);

        await FileControllerBackEnd.AddComment(id, commentId, comment, description);
        return res.status(200).json({ id: id, comment: comment, description: description });
    } catch (err) {
        console.error(err);
    }
    return res.sendStatus(500);
});

FileExpressController.get('/', async (req: express.Request, res: express.Response) => {
    try {
        const files = await FileControllerBackEnd.GetFilesForCurrentUser();
        return res.json(files);
    } catch (err) {
        console.error(err);
    }
    return res.sendStatus(404);
});

FileExpressController.get('/all', async (req: express.Request, res: express.Response) => {
    try {
        const files = await FileControllerBackEnd.GetAll();
        return res.json(files);
    } catch (err) {
        console.error(err);
    }
    return res.sendStatus(404);
});
FileExpressController.get('/:id/comments/:commentId', async (req: express.Request, res: express.Response) => {
    const id = String(req.params.id).trim();
    const commentId = String(req.params.commentId).trim();

    if (id === "" || commentId === "")
        return res.sendStatus(404);

    try {
        const comment = await FileControllerBackEnd.GetCommentById(id, commentId);
        return res.json(comment);
    } catch (err) {
        console.error(err);
    }
    return res.sendStatus(404);
});
FileExpressController.get('/:id/comments', async (req: express.Request, res: express.Response) => {
    const id = String(req.params.id).trim();

    if (id === "")
        return res.sendStatus(404);

    try {
        const comments = await FileControllerBackEnd.GetComments(id);
        return res.json(comments);
    } catch (err) {
        console.error(err);
    }
    return res.sendStatus(404);
});

FileExpressController.get('/:id/viewer', async (req: express.Request, res: express.Response) => {
    const id = String(req.params.id).trim();

    if (id === "")
        return res.sendStatus(404);

    try {
        const viewer = await FileControllerBackEnd.GetViewerToFile(id);
        return res.json(viewer);
    } catch (err) {
        console.error(err);
    }
    return res.sendStatus(404);
});
FileExpressController.get('/:id/upload', async (req: express.Request, res: express.Response) => {
    const id = String(req.params.id).trim();

    if (id === "")
        return res.sendStatus(404);

    try {
        const uploads = await FileControllerBackEnd.GetUploadToFile(id);
        return res.json(uploads);
    } catch (err) {
        console.error(err);
    }
    return res.sendStatus(404);
});
FileExpressController.post('/:id/viewer', async (req: express.Request, res: express.Response) => {
    const id = String(req.params.id).trim();
    const user = String(req.body.user).trim();

    if (id === "" || user === "")
        return res.sendStatus(500);

    try {
        await FileControllerBackEnd.AddViewerToFile(id, user);
        return res.sendStatus(200);
    } catch (err) {
        console.error(err);
    }
    return res.sendStatus(404);
});
FileExpressController.post('/:id/upload', async (req: express.Request, res: express.Response) => {
    const id = String(req.params.id).trim();
    const user = String(req.body.user).trim();

    if (id === "" || user === "")
        return res.sendStatus(500);

    try {
        await FileControllerBackEnd.AddUploaderToFile(id, user);
        return res.sendStatus(200);
    } catch (err) {
        console.error(err);
    }
    return res.sendStatus(404);
});
FileExpressController.delete('/:id/viewer/:user', async (req: express.Request, res: express.Response) => {
    const id = String(req.params.id).trim();
    const user = String(req.body.user).trim();

    if (id === "" || user === "")
        return res.sendStatus(500);

    try {
        await FileControllerBackEnd.RemoveViewerFromFile(id, user);
        return res.sendStatus(200);
    } catch (err) {
        console.error(err);
    }
    return res.sendStatus(404);
});
FileExpressController.delete('/:id/upload/:user', async (req: express.Request, res: express.Response) => {
    const id = String(req.params.id).trim();
    const user = String(req.body.user).trim();

    if (id === "" || user === "")
        return res.sendStatus(500);

    try {
        await FileControllerBackEnd.RemoveUploaderFromFile(id, user);
        return res.sendStatus(200);
    } catch (err) {
        console.error(err);
    }
    return res.sendStatus(404);
});

FileExpressController.get('/:id', async (req: express.Request, res: express.Response) => {
    const id = String(req.params.id).trim();
    try {
        const file = await FileControllerBackEnd.GetDownloadLink(id);

        res.contentType(String(file.extension));
        const buffer = await IPFS.GetFile(String(file.IPFS));
        return await IPFS.Download(res, buffer);
    } catch (err) {
        console.error(err);
    }
    return res.sendStatus(404);
});

