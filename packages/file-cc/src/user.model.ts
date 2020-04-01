import * as yup from 'yup';
import {
  ConvectorModel,
  ReadOnly,
  Required,
  Validate,
  FlatConvectorModel
} from '@worldsibu/convector-core-model';

export const DefaultUserName = "GENESIS";

export class x509Identities extends ConvectorModel<x509Identities>{
  @ReadOnly()
  public readonly type = 'io.worldsibu.examples.x509identity';

  @Validate(yup.boolean())
  @Required()
  Status!: boolean;
  @Validate(yup.string())
  @Required()
  Fingerprint!: string;
}

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
  public MSPId!: string;

  @ReadOnly()
  @Required()
  @Validate(yup.string())
  // Set what Type of User this is
  // Perform Validation and Type Setting on User End
  public TypeUser!: string;

  @Validate(yup.array(x509Identities.schema()))
  public Identities!: Array<FlatConvectorModel<x509Identities>>;

}