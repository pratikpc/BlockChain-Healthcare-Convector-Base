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

  @ReadOnly()
  @Required()
  @Validate(yup.string())
  public Name!: string;

  @ReadOnly()
  @Required()
  @Validate(yup.date())
  public Created!: Date;

  @ReadOnly()
  @Required()
  @Validate(yup.string())
  public PublicKey!: string;

  @ReadOnly()
  @Required()
  @Validate(yup.string())
  // Set what Type of User this is
  // Perform Validation and Type Setting on User End
  public TypeUser!: string;
}