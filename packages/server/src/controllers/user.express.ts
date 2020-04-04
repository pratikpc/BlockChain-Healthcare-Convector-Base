import { Router, Request, Response } from 'express';
import { UserControllerBackEnd, FabricAdapter, SignIn, SignOut } from '../convector';
import { CreateUser } from "./UserCreator";
import * as uuid from 'uuid';
import { identityOrg } from '../env';

export const UserExpressController = Router();

UserExpressController.post("/create", async (req: Request, res: Response) => {
    try {
        const params = req.body;

        if (params == null)
            return res.sendStatus(500);

        // Let it be uuid for now
        const id = uuid();

        const name = String(params.name).trim();
        const typeUser = String(params.typeUser).trim();
        if (id === "" || name === "" || typeUser === "")
            return res.sendStatus(500);

            console.log("333",name, typeUser, req.body, req.params, req.query);

        await CreateUser(name, identityOrg, FabricAdapter.client, [
            { name: "typeUser", value: typeUser, ecert: true },
            { name: "name", value: name, ecert: true },
            { name: "id", value: id, ecert: true }
        ]);

        await UserControllerBackEnd.$withUser(name).Generate();
        return res.sendStatus(200);
    } catch (err) {
        console.error(err);
    }
    return res.sendStatus(500);

});

UserExpressController.post('/signIn', async (req: Request, res: Response) => {
    const params = req.body;

    if (params == null)
        return res.sendStatus(500);

    const name = String(params.name).trim();

    try {
        await SignIn(name);
        return res.sendStatus(200);
    } catch (err) {
        console.error(err);
    }
    return res.sendStatus(500);
})
UserExpressController.post('/signOut', async (req: Request, res: Response) => {
    const params = req.body;

    if (params == null)
        return res.sendStatus(500);

    const name = String(params.name).trim();

    try {
        await SignOut(name);
        return res.sendStatus(200);
    } catch (err) {
        console.error(err);
    }
    return res.sendStatus(500);
})

UserExpressController.get('/', async (req: Request, res: Response) => {
    try {
        const users = await UserControllerBackEnd.GetAll();
        return res.json(users);
    } catch (err) {
        console.error(err);
    }
    return res.sendStatus(404);
});

UserExpressController.get('/:id', async (req: Request, res: Response) => {
    try {
        let { id } = req.params;
        const user = await UserControllerBackEnd.Get(id);
        return res.json(user);
    } catch (err) {
        console.error(err);
    }
    return res.sendStatus(404);
});
