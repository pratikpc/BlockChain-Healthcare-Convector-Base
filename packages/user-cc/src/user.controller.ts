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
  public async Create(
    @Param(User.schema())
    user: User
  ) {
    if (user == null)
      return null;
    await user.save();
    return user;
  }

  @Invokable()
  public async Generate(
    @Param(yup.string())
    id: string,
    @Param(yup.string())
    name: string,
    @Param(yup.string())
    publicKey: string,
    @Param(yup.string())
    typeUser: string
  ) {
    const user = new User({
      id: id,
      name: name,
      PublicKey: publicKey,
      created: this.tx.stub.getTxDate(),
      typeUser: typeUser
    });
    await user.save();
    return user;
  }

  @Invokable()
  public async Initial(){
    const user = new User({
      id: this.tx.stub.generateUUID("GENESIS"),
      name: "NAME-USER",
      PublicKey: "SECRET-KEY",
      created: this.tx.stub.getTxDate(),
      typeUser: "PATIENT"
    });
    // this.tx.identity.
    await user.save();
    return user;
  }
  
  @Invokable()
  public async Get(
    @Param(yup.string())
    id: string
  ) {
    let user = await User.getOne(id);
    if (user == null || user.id == null)
      return null;
    return user;
  }

  @Invokable()
  public async GetAll( ) {
    return await User.getAll();
  }
}
