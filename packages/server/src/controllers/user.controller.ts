import { Router, Request, Response } from 'express';
import { UserControllerBackEnd, FabricAdapter } from '../convector';
import { CreateUser } from "./UserCreator";
import * as uuid from 'uuid';

export const UserExpressController = Router();

UserExpressController.get("/create", (req: Request, res: Response) => {
    return res.render("user-create.hbs");
});

UserExpressController.post("/create", async (req: Request, res: Response) => {
    const params = req.body;

    if (params == null)
        return res.sendStatus(404);

    // Let it be uuid for now
    const id = uuid();

    const name = String(params.name).trim();
    const typeUser = String(params.typeUser).trim();

    if (id === "" || name === "" || typeUser === "")
        return res.sendStatus(404);

    await CreateUser(name, "org1", FabricAdapter.client, [{ name: "typeUser", value: typeUser, ecert: true },{ name: "name", value: name, ecert: true }]);

    await UserControllerBackEnd.$withUser(name).Generate();
    return res.redirect("/user/create");
});

UserExpressController.get('/', async (req: Request, res: Response) => {
    try {
        console.log("444", UserControllerBackEnd.user);
        const users = await UserControllerBackEnd.GetAll();
        console.log("444", users);
        return res.json(users);
    } catch (err) {
        console.error(err);
        return res.status(500).send(err);
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
