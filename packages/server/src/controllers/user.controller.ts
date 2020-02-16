import { Router, Request, Response } from 'express';
import { UserControllerBackEnd } from '../convector';

export const UserExpressController = Router();

UserExpressController.get('/', async (req: Request, res: Response) => {
    try {
        const users = await UserControllerBackEnd.GetAll();
        res.send(users);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

UserExpressController.get('/:id', async (req: Request, res: Response) => {
    try {
        let { id } = req.params;
        const user = await UserControllerBackEnd.Get(id);
        res.send(user);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});
