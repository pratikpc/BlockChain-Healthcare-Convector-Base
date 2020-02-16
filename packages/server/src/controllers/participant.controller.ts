import { Router, Request, Response } from 'express';
import { ParticipantControllerBackEnd, InitServerIdentity } from '../convector';

export const ParticipantExpressController = Router();

ParticipantExpressController.get('/:id', async (req: Request, res: Response) => {
    try {
        let { id } = req.params;
        res.send(await ParticipantControllerBackEnd.get(id));
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});