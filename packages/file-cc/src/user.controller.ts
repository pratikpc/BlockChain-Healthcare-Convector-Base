import * as yup from 'yup';
import { ChaincodeTx } from '@worldsibu/convector-platform-fabric';
import {
  Controller,
  ConvectorController,
  Invokable,
  Param,
} from '@worldsibu/convector-core';
import { User, DefaultUserName } from './user.model';
import * as Utils from "./utils";

@Controller('user')
export class UserController extends ConvectorController<ChaincodeTx> {
  @Invokable()
  public async Generate() {
    const identity = this.tx.identity;

    const name = identity.getAttributeValue('name') || "Name";
    const id = identity.getAttributeValue('id') || DefaultUserName;
    const typeUser = identity.getAttributeValue('typeUser') || "TypeUser";
    const existing = await User.getOne(id);
    if (existing != null && existing.id != null)
      return null;

    const user = new User({
      id: id,
      Name: name,
      Created: this.tx.stub.getTxDate(),
      TypeUser: typeUser,
      MSPId: this.tx.identity.getMSPID(),
      Identities: [{
        Status: true,
        Fingerprint: this.sender
      }]
    });
    await user.save();
    return user;
  }

  private async PrivGetFromId(id: string) {
    const user = await User.getOne(id);
    if (user == null || user.id == null)
      throw new Error("User: ID Not Found");
    return user;
  }
  @Invokable()
  public async Get(
    @Param(yup.string())
    id: string
  ) {
    return await this.PrivGetFromId(id);
  }
  private async PrivGetUserFromName(name: string) {
    const users = Utils.ToArray(await User.query(User, {
      selector: {
        "Name": name
      }
    }));
    if (users.length === 0)
      throw new Error("User: Name Not Found");
    const user = users[0];
    return user;

  }
  @Invokable()
  public async GetFromName(
    @Param(yup.string())
    name: string
  ) {
    return this.PrivGetUserFromName(name);
  }
  @Invokable()
  public async GetIDFromName(
    @Param(yup.string())
    name: string
  ) {
    const user = await this.PrivGetUserFromName(name);
    return user.id;
  }
  @Invokable()
  public async GetCurrentUser() {
    const user = await User.getOne(this.tx.identity.getAttributeValue("id") || DefaultUserName);
    return {id: user.id, Name: user.Name, MSPid: user.MSPId};
  }
  @Invokable()
  public async GetTypeOfUser(
    @Param(yup.string())
    id: string
  ) {
    const user = await this.PrivGetFromId(id);
    return user.TypeUser;
  }

  @Invokable()
  public async GetAll() {
    const users_raw = await User.getAll();
    const users = users_raw.map((user_raw) => {
      return {
        id: user_raw.id,
        Name: user_raw.Name
      }
    });
    return users;
  }
}
