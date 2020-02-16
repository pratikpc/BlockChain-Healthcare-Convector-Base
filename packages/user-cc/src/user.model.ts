import * as yup from 'yup';
import {
  ConvectorModel,
  ReadOnly,
  Required,
  Validate
} from '@worldsibu/convector-core-model';

export class User extends ConvectorModel<User> {
  @ReadOnly()
  @Required()
  public readonly type = 'io.worldsibu.user';

  @Required()
  @Validate(yup.string())
  public name: string;

  @ReadOnly()
  @Required()
  @Validate(yup.date())
  public created: Date;

  @ReadOnly()
  @Required()
  @Validate(yup.string())
  public PublicKey: string;

  @ReadOnly()
  @Validate(yup.string())
  // One of Doctor, Patient or Clinician
  public typeUser: string;
}