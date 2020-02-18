import { ChaincodeTx } from "@worldsibu/convector-platform-fabric";
import {
  Controller,
  ConvectorController,
  Invokable,
  Param
} from "@worldsibu/convector-core";

import * as yup from "yup";
import { File, FilePrivateDetails, FileComments } from "./file.model";

import { User } from "user-cc";

@Controller("file")
export class FileController extends ConvectorController<ChaincodeTx> {

  private readonly FilePrivateStorage = "collectionfileprivatestorage";


  @Invokable()
  public async Initial() {

    if ((await File.getAll()).length !== 0)
      throw new Error("Create Genesis only when File Length = 0");

    const id = this.tx.stub.generateUUID("GENESIS");
    const file = new File({
      created: this.tx.stub.getTxDate(),
      id: id,
      Recipient: [],
      Viewer: [],
      Uploader: []
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

    async function CheckIfExists(users: Array<String>) {
      await User.query(User, {
        selector: {
          id: { "$in": users }
        }
      });
      return true;
    }

    const existing = await File.getOne(id);
    // CHeck if Already Exists
    if (existing != null && existing.id != null)
      throw new Error("File Contract. File Already Exists");
    const file = new File({
      id: id,
      created: this.tx.stub.getTxDate(),
      Recipient: recipient,
      Viewer: viewer,
      Uploader: uploader
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

  @Invokable()
  public async AddDescriptionToFile(
    @Param(yup.string())
    id: string,
    @Param(yup.string())
    Comment: string,
    @Param(yup.string())
    Description: string,
    @Param(yup.string())
    CreatorId: string) {

    const file_private = await FilePrivateDetails.getOne(id, FilePrivateDetails, { privateCollection: this.FilePrivateStorage });

    // Check if Does not Exist
    if (file_private == null || file_private.id == null)
      throw new Error("File Contract. Unable to Add Description. ID Does Not Exist on File Private");

    const file = await File.getOne(id, File);
    // Check if Already Exists
    if (file == null || file.id == null)
      throw new Error("File Contract. Unable to Add Description. ID Does Not Exist on File");

    if (file.Uploader.indexOf(CreatorId) === -1 || file.Viewer.indexOf(CreatorId) === -1 || file.Recipient.indexOf(CreatorId) === -1)
      throw new Error("File Contract. Comments Can Only be Added By Creators");

    const file_description = new FileComments({
      DateAdded: this.tx.stub.getTxDate(),
      Comments: Comment,
      Description: Description,
      CreatorId: CreatorId
    });

    file_private.Comments.push(file_description);

    await file_private.save({ privateCollection: this.FilePrivateStorage });
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
    file.Viewer.push(viewer);
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
    file.Uploader.push(uploader);
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
    file.Viewer = file.Viewer.filter(d => d !== viewer);
    await file.save();
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
    file.Uploader = file.Uploader.filter(c => c !== uploader);
    await file.save();
  }

  @Invokable()
  public async GetMetaData(
    @Param(yup.string())
    id: string) {
    return await File.getOne(id, File);
  }
  @Invokable()
  public async GetActualFile(
    @Param(yup.string())
    id: string) {
    return await FilePrivateDetails.getOne(id, FilePrivateDetails, { privateCollection: this.FilePrivateStorage });
  }
  @Invokable()
  public async GetDownloadLink(
    @Param(yup.string())
    id: string) {
    const file_priv = (await FilePrivateDetails.getOne(id, FilePrivateDetails, { privateCollection: this.FilePrivateStorage }));
    if (file_priv == null || file_priv.id == null)
      throw new Error("File Contract File Not Found");
    return { IPFS: file_priv.IPFS, extension: file_priv.extension };
  }

  @Invokable()
  public async GetComments(
    @Param(yup.string())
    id: string) {
    const file_priv = await FilePrivateDetails.getOne(id, FilePrivateDetails, { privateCollection: this.FilePrivateStorage });
    if (file_priv == null || file_priv.id == null)
      throw new Error("File Contract File Not Found");
    const comments_model = file_priv.Comments;
    const comments = comments_model.map((comment_model => comment_model as FileComments));
    return comments;
  }


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
    return this.ToArray(files);
  }

  private ToArray<T>(element: T | Array<T>) {
    if (element instanceof Array)
      return element;
    else
      return [element];
  }

  @Invokable()
  public async GetFilesByIdFromUser(
    @Param(yup.string())
    id: string
  ) {
    const query_result = await File.query(File, {
      selector: {
        $or: [
          {
            Recipient: {
              $elemMatch: id
            }
          },
          {
            Viewer: {
              $elemMatch: id
            }
          },
          {
            Uploader: {
              $elemMatch: id
            }
          }
        ]
      }
    });
    return this.ToArray(query_result);
  }
}