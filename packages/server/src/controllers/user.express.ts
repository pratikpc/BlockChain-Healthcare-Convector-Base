import { Router, Request, Response } from 'express';
import { UserControllerBackEnd } from '../convector';
import * as Convector from "../convector";
import * as Utils from "../utils";
import { CreateUser } from "./UserCreator";
import * as uuid from 'uuid';
import { identityOrg } from '../env';

export const UserExpressController = Router();

UserExpressController.post("/create", async (req: Request, res: Response) => {
    try {

            return res.sendStatus(500);

        // Let it be uuid for now
        const id = uuid();

        const name = String(body.name).trim();
        const password = String(body.password).trim();
        const typeUser = String(body.typeUser).trim();
        if (id === "" || name === "" || password === "" || typeUser === "")
            return res.sendStatus(500);
        const attrs = [
            { name: "typeUser", value: typeUser, ecert: true },
            { name: "name", value: name, ecert: true },
            { name: "id", value: id, ecert: true }
        ];
        await Utils.Auth.SignUp(password, name, attrs);
        await CreateUser(name, identityOrg, Convector.FabricAdapter.client, attrs);
        await UserControllerBackEnd.$withUser(name).Generate();
        return res.sendStatus(200);
    } catch (err) {
        console.error(err);
    }
    return res.sendStatus(500);

});

UserExpressController.post('/signIn', async (req: Request, res: Response) => {

    if (body == null || body.name == null || body.password == null)
        return res.sendStatus(500);

    const name = String(body.name).trim();
    const password = String(body.password).trim();

    try {
        await Utils.Auth.SignIn(password, name);
        await Convector.SignIn(name);
        return res.sendStatus(200);
    } catch (err) {
        console.error(err);
    }
    return res.sendStatus(500);
});

UserExpressController.post('/changePassword', async (req: Request, res: Response) => {
    const body = req.body;

    if (body == null || body.name == null || body.password == null || body.oldPassword == null)
        return res.sendStatus(500);

    const name = String(body.name).trim();
    const password = String(body.password).trim();
    const oldPassword = String(body.oldPassword).trim();

    try {
        await Utils.Auth.ChangePassword(password, oldPassword, name);
        await Utils.Auth.SignIn(password, name);
        await Convector.SignIn(name);
        return res.sendStatus(200);
    } catch (err) {
        console.error(err);
    }
    return res.sendStatus(500);
});

UserExpressController.post('/signOut', async (req: Request, res: Response) => {
    const params = req.body;

    if (params == null)
        return res.sendStatus(500);

    const name = String(params.name).trim();

    try {
        await Utils.Auth.SignOut();
        await Convector.SignOut(name);
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
