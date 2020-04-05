import * as yup from 'yup';
import {
  ConvectorModel,
  ReadOnly,
  Required,
  Validate,
  FlatConvectorModel
} from '@worldsibu/convector-core-model';

// Attach Description of File to Comments
export class FileComment extends ConvectorModel<FileComment> {
  @ReadOnly()
  @Required()
  public readonly type = 'io.worldsibu.filedescription';

  @ReadOnly()
  @Required()
  @Validate(yup.string())
  public CommentId!: string;

  @ReadOnly()
  @Required()
  @Validate(yup.date())
  public DateAdded!: Date;

  @ReadOnly()
  @Required()
  @Validate(yup.string())
  public Comment!: string;

  @ReadOnly()
  @Required()
  @Validate(yup.string())
  public Description!: string;

  @ReadOnly()
  @Required()
  @Validate(yup.string())
  // Foreign Key Linkage
  public CreatorId!: string;
}

export class FilePrivateDetails extends ConvectorModel<FilePrivateDetails>{
  @ReadOnly()
  @Required()
  public readonly type = 'io.worldsibu.fileprivate';

  @Required()
  @Validate(yup.string())
  public Hash!: string;

  @ReadOnly()
  @Required()
  @Validate(yup.string())
  public IPFS!: string;

  @ReadOnly()
  @Required()
  @Validate(yup.string())
  public extension!: string;

  // Store the File Description on Convector
  // Remember that This List can only be appended to
  // It cannot be unappended from
  @Validate(yup.array(FileComment.schema()))
  public Comments!: Array<FlatConvectorModel<FileComment>>;
}

export class File extends ConvectorModel<File> {
  @ReadOnly()
  @Required()
  public readonly type = 'io.worldsibu.file';

  @Required()
  @Validate(yup.array(yup.string()))
  // Foreign Key Linkages
  public Uploader!: Array<String>;

  @Required()
  @Validate(yup.array(yup.string()))
  // Foreign Key Linkages
  public Viewer!: Array<String>;

  @Required()
  @Validate(yup.array(yup.string()))
  // Foreign Key Linkages
  public Recipient!: Array<String>;

  @ReadOnly()
  @Required()
  @Validate(yup.date())
  public created!: Date;
}