import { ChaincodeTx } from "@worldsibu/convector-platform-fabric";
import {
  Controller,
  ConvectorController,
  Invokable,
  Param
} from "@worldsibu/convector-core";

import * as yup from "yup";
import * as Utils from "./utils";
import { File, FilePrivateDetails, FileComment } from "./file.model";
import { User, DefaultUserName } from './user.model';

@Controller("file")
export class FileController extends ConvectorController<ChaincodeTx> {

  private readonly FilePrivateStorage = "collectionfileprivatestorage";


  private GetCurrentUserId(defaultUserName = DefaultUserName) {
    return this.tx.identity.getAttributeValue("id") || defaultUserName;
  }

  @Invokable()
  public async Initial() {

    if ((await File.getAll()).length !== 0)
      throw new Error("Create Genesis only when File Length = 0");

    const id = this.tx.stub.generateUUID(DefaultUserName);
    const file = new File({
      created: this.tx.stub.getTxDate(),
      id: id,
      Recipient: [],
      Viewer: [],
      Uploader: [this.tx.identity.getAttributeValue("id") || DefaultUserName]
    });
    await file.save();

    const file_private = new FilePrivateDetails({
      id: id,
      extension: ".",
      Comments: [],
      Hash: "",
      IPFS: ""
    });
    await file_private.save({ privateCollection: this.FilePrivateStorage });

    return file;
  }

  private async PrivGetUserIDsFromNames(names: Array<String>) {
    const users_raw = Utils.ToArray(await User.query(User, {
      selector: {
        Name: {
          $in: names
        }
      }
    }));
    const user_ids = users_raw.map(user_raw => user_raw.id);
    return user_ids;
  }

  @Invokable()
  public async Create(
    @Param(yup.string())
    id: string,
    @Param(yup.string())
    ipfs: string,
    @Param(yup.string())
    hash: string,
    @Param(yup.string())
    extension: string,
    @Param(yup.array(yup.string()))
    recipient: Array<String>,
    @Param(yup.array(yup.string()))
    uploader: Array<String>,
    @Param(yup.array(yup.string()))
    viewer: Array<String>
  ) {

    if (uploader.length === 0 && viewer.length === 0)
      throw new Error("File Contract. Viewer or Uploader needed to create every file");

    if (recipient.length === 0)
      throw new Error("File Contract. No Recipient Assigned");

    if (ipfs === "" || extension === "" || id === "" || hash === "")
      throw new Error("File Contract. Params must have proper values");

    const existing = await File.getOne(id);
    // CHeck if Already Exists
    if (existing != null && existing.id != null)
      throw new Error("File Contract. File Already Exists");

    uploader = await this.PrivGetUserIDsFromNames(uploader);
    viewer = await this.PrivGetUserIDsFromNames(viewer);
    recipient = await this.PrivGetUserIDsFromNames(recipient);
    
    const file = new File({
      id: id,
      created: this.tx.stub.getTxDate(),
      Recipient: recipient,
      Viewer: viewer,
      Uploader: [...uploader, this.tx.identity.getAttributeValue("id") || DefaultUserName]
    });
    await file.save();
    const file_private = new FilePrivateDetails({
      id: id,
      IPFS: ipfs,
      extension: extension,
      Hash: hash,
      Comments: []
    });
    await file_private.save({ privateCollection: this.FilePrivateStorage });

    return file;
  }

  private async PrivCheckUserClaim(userList: Array<String>, userId: string) {
    // Verify if User by Given ID is present in the Lists
    if (!userList.includes(userId))
      return false;

    // Verify if the User is Who s/he claims to be
    const user = await User.getOne(userId);
    if (user == null || user.MSPId !== this.tx.identity.getMSPID())
      return false;
    const active = user.Identities.findIndex((identity) => {
      return identity.Fingerprint === this.sender && identity.Status;
    });
    if (active === -1)
      return false;
    return true;
  }

  private async PrivUserHasViewAccess(file: File, userId: string) {
    // Verify if User by Given ID is present in the Lists
    if (!(file.Uploader.includes(userId) || file.Viewer.includes(userId) || file.Recipient.includes(userId)))
      return false;
    const users = [...file.Uploader, ...file.Viewer, ...file.Recipient];
    return await this.PrivCheckUserClaim(users, userId);
  }

  private async PrivUserIsRecipient(file: File, userId: string) {
    return await this.PrivCheckUserClaim(file.Recipient, userId);
  }

  @Invokable()
  public async AddComment(
    @Param(yup.string())
    fileId: string,
    @Param(yup.string())
    id: string,
    @Param(yup.string())
    Comment: string,
    @Param(yup.string())
    Description: string) {

    const file_private = await FilePrivateDetails.getOne(fileId, FilePrivateDetails, { privateCollection: this.FilePrivateStorage });

    // Check if Does not Exist
    if (file_private == null || file_private.id == null)
      throw new Error("File Contract. Unable to Add Description. ID Does Not Exist on File Private");

    const file = await File.getOne(fileId, File);
    // Check if Already Exists
    if (file == null || file.id == null)
      throw new Error("File Contract. Unable to Add Description. ID Does Not Exist on File");

    const creatorId = this.GetCurrentUserId();

    if (! await this.PrivUserHasViewAccess(file, creatorId))
      throw new Error("This User is Not allowed to Insert any values");

    const file_comment = new FileComment({
      id: id,
      DateAdded: this.tx.stub.getTxDate(),
      Comment: Comment,
      Description: Description,
      CreatorId: creatorId
    });

    file_private.Comments.push(file_comment);

    await file_private.save({ privateCollection: this.FilePrivateStorage });
  }
  @Invokable()
  public async GetViewerToFile(
    @Param(yup.string())
    id: string) {
    const file = await File.getOne(id);
    if (file == null || file.id == null) {
      throw new Error("File Contract. Unable to Find. ID Does Not Exist on File");
    }
    if (! await this.PrivUserIsRecipient(file, this.GetCurrentUserId()))
      throw new Error("File Contract. This User is Not allowed to Access");
    return file.Viewer;
  }
  @Invokable()
  public async AddViewerToFile(
    @Param(yup.string())
    id: string,
    @Param(yup.string())
    viewer: string
  ) {
    const file = await File.getOne(id);
    if (file == null || file.id == null) {
      throw new Error("File Contract. Unable to Add Description. ID Does Not Exist on File");
    }
    if (! await this.PrivUserIsRecipient(file, this.GetCurrentUserId()))
      throw new Error("This User is Not allowed to Insert any values");
    file.Viewer.push(viewer);
    await file.save();
  }
  @Invokable()
  public async RemoveViewerFromFile(
    @Param(yup.string())
    id: string,
    @Param(yup.string())
    viewer: string
  ) {
    const file = await File.getOne(id);
    if (file == null || file.id == null) {
      throw new Error("File Contract. Unable to Add Description. ID Does Not Exist on File");
    }
    if (! await this.PrivUserIsRecipient(file, this.GetCurrentUserId()))
      throw new Error("This User is Not allowed to Insert any values");
    file.Viewer = file.Viewer.filter(d => d !== viewer);
    await file.save();
  }

  @Invokable()
  public async AddUploaderToFile(
    @Param(yup.string())
    id: string,
    @Param(yup.string())
    uploader: string
  ) {
    const file = await File.getOne(id);
    if (file == null || file.id == null) {
      throw new Error("File Contract. Unable to Add Description. ID Does Not Exist on File");
    }
    if (! await this.PrivUserIsRecipient(file, this.GetCurrentUserId()))
      throw new Error("This User is Not allowed to Insert any values");
    file.Uploader.push(uploader);
    await file.save();
  }
  @Invokable()
  public async GetUploadToFile(
    @Param(yup.string())
    id: string) {
    const file = await File.getOne(id);
    if (file == null || file.id == null) {
      throw new Error("File Contract. Unable to Find. ID Does Not Exist on File");
    }
    if (! await this.PrivUserIsRecipient(file, this.GetCurrentUserId()))
      throw new Error("File Contract. This User is Not allowed to Access");
    return file.Uploader;
  }
  @Invokable()
  public async RemoveUploaderFromFile(
    @Param(yup.string())
    id: string,
    @Param(yup.string())
    uploader: string
  ) {
    const file = await File.getOne(id);
    if (file == null || file.id == null) {
      throw new Error("File Contract. Unable to Add Description. ID Does Not Exist on File");
    }
    if (! await this.PrivUserIsRecipient(file, this.GetCurrentUserId()))
      throw new Error("This User is Not allowed to Insert any values");
    file.Uploader = file.Uploader.filter(c => c !== uploader);
    await file.save();
  }

  @Invokable()
  public async GetMetaData(
    @Param(yup.string())
    id: string) {
    const file = await File.getOne(id, File);
    if (! await this.PrivUserHasViewAccess(file, this.GetCurrentUserId()))
      throw new Error("This User is Not allowed to Insert any values");
    return file;
  }
  @Invokable()
  public async GetActualFile(
    @Param(yup.string())
    id: string) {
    const file = await File.getOne(id);
    if (file == null || file.id == null) {
      throw new Error("File Contract. Unable to Add Description. ID Does Not Exist on File");
    }
    if (! await this.PrivUserHasViewAccess(file, this.GetCurrentUserId()))
      throw new Error("This User is Not allowed to Insert any values");

    return await FilePrivateDetails.getOne(id, FilePrivateDetails, { privateCollection: this.FilePrivateStorage });
  }
  @Invokable()
  public async GetDownloadLink(
    @Param(yup.string())
    id: string) {
    const file = await File.getOne(id);
    if (file == null || file.id == null) {
      throw new Error("File Contract. Unable to Add Description. ID Does Not Exist on File");
    }
    const userId = this.GetCurrentUserId();
    if (! await this.PrivUserHasViewAccess(file, userId))
      throw new Error("This User is Not allowed to Download Files");

    const file_priv = (await FilePrivateDetails.getOne(id, FilePrivateDetails, { privateCollection: this.FilePrivateStorage }));
    if (file_priv == null || file_priv.id == null)
      throw new Error("File Contract File Not Found");

    return { IPFS: file_priv.IPFS, extension: file_priv.extension };
  }
  private async PrivGetAllComments(id: string) {
    const file = await File.getOne(id);
    if (file == null || file.id == null) {
      throw new Error("File Contract. Unable to Add Description. ID Does Not Exist on File");
    }
    if (! await this.PrivUserHasViewAccess(file, this.GetCurrentUserId()))
      throw new Error("This User is Not allowed to Insert any values");

    const file_priv = await FilePrivateDetails.getOne(id, FilePrivateDetails, { privateCollection: this.FilePrivateStorage });
    if (file_priv == null || file_priv.id == null)
      throw new Error("File Contract File Not Found");
    return file_priv.Comments;
  }

  @Invokable()
  public async GetComments(
    @Param(yup.string())
    fileId: string) {
    const comments_raw = await this.PrivGetAllComments(fileId);
    const comments = comments_raw.map((comment_model => comment_model as FileComment));
    return comments;
  }
  @Invokable()
  public async GetCommentById(
    @Param(yup.string())
    fileId: string,
    @Param(yup.string())
    id: string) {
    const comments_raw = await this.PrivGetAllComments(fileId);
    const comment_raw = comments_raw.filter(comment_raw => comment_raw.CommentId === id)[0];
    const comment = comment_raw as FileComment;
    return comment;
  }

  // Only for Debugging
  @Invokable()
  public async GetAll() {
    return await File.getAll();
  }

  @Invokable()
  public async GetAllForRecipient
    (@Param(yup.string())
    id: string) {
    const files = await File.query(File, {
      selector: {
        Recipient: {
          $elemMatch: id
        }
      }
    });
    return Utils.ToArray(files);
  }
  private async PrivGetFilesById(id: string) {
    const files = await File.query(File, {
      selector: {
        $or: [
          {
            Recipient: {
              $elemMatch: {
                $eq: id
              }
            }
          },
          {
            Viewer: {
              $elemMatch: {
                $eq: id
              }
            }
          },
          {
            Uploader: {
              $elemMatch: {
                $eq: id
              }
            }
          }
        ]
      }
    });
    return Utils.ToArray(files);
  }

  @Invokable()
  public async GetFilesById(
    @Param(yup.string())
    id: string
  ) {
    return await this.PrivGetFilesById(id);
  }
  @Invokable()
  public async GetFilesForCurrentUser() {
    const userId = this.GetCurrentUserId();
    return await this.PrivGetFilesById(userId);
  }
}