import { Router, Request, Response } from 'express';
import { FileControllerBackEnd } from '../convector';

export const FileExpressController = Router();

FileExpressController.get('/', async (req: Request, res: Response) => {
    console.log("Exress");
    const files = await FileControllerBackEnd.GetAll();
    console.log("abc", files);
    res.send(files);
});