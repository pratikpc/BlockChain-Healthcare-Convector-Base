import { ChaincodeTx } from "@worldsibu/convector-platform-fabric";
import {
  Controller,
  ConvectorController,
  Invokable,
  Param
} from "@worldsibu/convector-core";

import * as yup from "yup";
import { File, FilePrivateDetails } from "./file.model";

import { User } from "user-cc";

@Controller("file")
export class FileController extends ConvectorController<ChaincodeTx> {

  private readonly FilePrivateStorage = "collectionfileprivatestorage";


  @Invokable()
  public async Initial() {

    if ((await File.getAll()).length !== 0)
      throw new Error("Create Genesis only when File Length = 0");

    const file = new File();
    // Ensures Date of Creation Remains same
    file.created = this.tx.stub.getTxDate();
    // Ensures UUID Generated is always same
    file.id = this.tx.stub.generateUUID("GENESIS");

    file.Patient = [];
    file.Doctor = [];
    file.Clinician = [];
    await file.save();

    {
      const file_private = new FilePrivateDetails();
      file_private.id = file.id;
      file_private.extension = ".ext";
      file_private.IPFS = "";
      file_private.Hash = "";
      await file_private.save({ privateCollection: this.FilePrivateStorage });
    }

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
    patient: Array<String>,
    @Param(yup.array(yup.string()))
    clinician: Array<String>,
    @Param(yup.array(yup.string()))
    doctor: Array<String>
  ) {

    if (clinician.length === 0 && doctor.length === 0)
      throw new Error("File Contract. Doctor or Clinician needed to create every file");

    if (patient.length === 0)
      throw new Error("File Contract. No Patient Assigned");

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
      Patient: patient,
      Doctor: doctor,
      Clinician: clinician
    });
    await file.save();
    const file_private = new FilePrivateDetails({
      id: id,
      IPFS: ipfs,
      extension: extension,
      Hash: hash
    });
    await file_private.save({ privateCollection: this.FilePrivateStorage });

    return file;
  }

  @Invokable()
  public async AddDoctorToFile(
    @Param(yup.string())
    id: string,
    @Param(yup.string())
    doctor: string
  ) {
    const file = await File.getOne(id);
    if (file == null || file.id == null) {
      return;
    }
    file.Doctor.push(doctor);
    await file.save();
  }
  @Invokable()
  public async AddClinicianToFile(
    @Param(yup.string())
    id: string,
    @Param(yup.string())
    clinician: string
  ) {
    const file = await File.getOne(id);
    if (file == null || file.id == null) {
      return;
    }
    file.Clinician.push(clinician);
    await file.save();
  }

  @Invokable()
  public async RemoveDoctorFromFile(
    @Param(yup.string())
    id: string,
    @Param(yup.string())
    doctor: string
  ) {
    const file = await File.getOne(id);
    if (file == null || file.id == null) {
      return;
    }
    file.Doctor = file.Doctor.filter(d => d !== doctor);
    await file.save();
  }
  @Invokable()
  public async RemoveClinicianFromFile(
    @Param(yup.string())
    id: string,
    @Param(yup.string())
    clinician: string
  ) {
    const file = await File.getOne(id);
    if (file == null || file.id == null) {
      return;
    }
    file.Clinician = file.Clinician.filter(c => c !== clinician);
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
  public async GetAll() {
    return await File.getAll();
  }

  @Invokable()
  public async GetAllForPatient
    (@Param(yup.string())
    id: string) {
    return await File.query(File, {
      selector: {
        Patient: {
          $elemMatch: id
        }
      }
    });

  }

  @Invokable()
  public async GetFilesByIdFromUser(
    @Param(yup.string())
    id: string
  ) {
    return await File.query(File, {
      selector: {
        $or: [
          {
            Patient: {
              $elemMatch: id
            }
          },
          {
            Doctor: {
              $elemMatch: id
            }
          },
          {
            Clinician: {
              $elemMatch: id
            }
          }
        ]
      }
    });
  }
}