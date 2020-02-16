import * as yup from 'yup';
import {
  ConvectorModel,
  ReadOnly,
  Required,
  Validate
} from '@worldsibu/convector-core-model';

export class FilePrivateDetails extends ConvectorModel<FilePrivateDetails>{
  @ReadOnly()
  @Required()
  public readonly type = 'io.worldsibu.fileprivate';

  @Required()
  @Validate(yup.string())
  public Hash: string;

  @ReadOnly()
  @Required()
  @Validate(yup.string())
  public IPFS: string;

  @ReadOnly()
  @Required()
  @Validate(yup.string())
  public extension: string;
}

export class File extends ConvectorModel<File> {
  @ReadOnly()
  @Required()
  public readonly type = 'io.worldsibu.file';

  @Required()
  @Validate(yup.array(yup.string()))
  // Foreign Key Linkages
  public Clinician: Array<String>;

  @Required()
  @Validate(yup.array(yup.string()))
  // Foreign Key Linkages
  public Doctor: Array<String>;

  @Required()
  @Validate(yup.array(yup.string()))
  // Foreign Key Linkages
  public Patient: Array<String>;

  @ReadOnly()
  @Required()
  @Validate(yup.date())
  public created: Date;

}