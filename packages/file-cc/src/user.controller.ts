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

  @Invokable()
  public async Get(
    @Param(yup.string())
    id: string
  ) {
    const user = await User.getOne(id);
    if (user == null || user.id == null)
      return null;
    return user;
  }
  @Invokable()
  public async GetByName(
    @Param(yup.string())
    name: string
  ) {
    const users = Utils.ToArray(await User.query(User, {
      selector: {
        "Name": name
      }
    }));
    if (users.length === 0)
      return null;
    const user = users[0];
    if (user == null || user.id == null)
      return null;
    return user;
  }

  @Invokable()
  public async GetTypeOfUser(
    @Param(yup.string())
    id: string
  ) {
    const user = await User.getOne(id);
    if (user == null || user.id == null)
      return "";
    return user.TypeUser;
  }


  @Invokable()
  public async GetAll() {
    return await User.getAll();
  }
}
