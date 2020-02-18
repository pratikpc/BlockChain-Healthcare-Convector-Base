import * as yup from 'yup';
import { ChaincodeTx } from '@worldsibu/convector-platform-fabric';
import {
  Controller,
  ConvectorController,
  Invokable,
  Param,
} from '@worldsibu/convector-core';
import { User } from './user.model';

@Controller('user')
export class UserController extends ConvectorController<ChaincodeTx> {
  @Invokable()
  public async Generate() {
    const identity = this.tx.identity;

    const name = identity.getAttributeValue('name') || "Name";
    const typeUser = identity.getAttributeValue('typeUser') || "TypeUser";

    const user = new User({
      id: identity.getID(),
      Name: name,
      Created: this.tx.stub.getTxDate(),
      TypeUser: typeUser
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
  public async GetTypeOfUser(
    @Param(yup.string())
    id: string
  ) {
    let user = await User.getOne(id);
    if (user == null || user.id == null)
      return "";
    return user.TypeUser;
  }


  @Invokable()
  public async GetAll() {
    return await User.getAll();
  }
}
