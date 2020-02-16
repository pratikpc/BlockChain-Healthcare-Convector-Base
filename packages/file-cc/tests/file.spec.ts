// tslint:disable:no-unused-expression
import { join } from 'path';
import { expect } from 'chai';
import * as uuid from 'uuid/v4';
import { MockControllerAdapter } from '@worldsibu/convector-adapter-mock';
import { ClientFactory, ConvectorControllerClient } from '@worldsibu/convector-core';
import 'mocha';

import { File, FileController } from '../src';
import { User } from 'user-cc';

describe("File", () => {
  let adapter: MockControllerAdapter;
  let FileCtrl: ConvectorControllerClient<FileController>;

  before(async () => {
    // Mocks the blockchain execution environment
    adapter = new MockControllerAdapter();
    FileCtrl = ClientFactory(FileController, adapter);

    await adapter.init([
      {
        version: "*",
        controller: "FileController",
        name: join(__dirname, "..")
      }
    ]);

    adapter.addUser("Test");
  });

  it("should create a default FileController model", async () => {
    const modelSample = new File({
      id: "213",
      Hash: "",
      Doctor: [],
      Clinician: [],
      Patient: [],
      extension: "ext",
      IPFS: "",
      created: new Date()
    });

    await FileCtrl.$withUser("Test").create(modelSample);

    const justSavedModel = await adapter.getById<File>(modelSample.id);

    expect(justSavedModel.id).to.exist;
  });
  it("Perform Debug Check", async () => {
    const modelSample = await FileCtrl.$withUser("Test").File(
      "abcd",
      null,
      "this is the data to be added to a database",
      ".txt",
      [],
      [],
      []
    );
    const modelT = modelSample as any;
    const justSavedModel = await adapter.getById<File>(modelT._id);
    expect(justSavedModel.id).to.exist;
  });
  it("Check if After Multiple Inserts, we can get the Data we want", async () => {
    const user1 = new User();
    user1.id = "1";
    const user2 = new User();
    user2.id = "2";
    await FileCtrl.$withUser("Test").File(
      "1abcd",
      null,
      "1this is the data to be added to a database",
      ".txt",
      [user1, user2],
      [],
      []
    );
    await FileCtrl.$withUser("Test").File(
      "2abcd",
      null,
      "this is the data to be added to a database",
      ".txt",
      [user2],
      [user1],
      []
    );
    await FileCtrl.$withUser("Test").File(
      "3abcd",
      null,
      "this is the data to be added to a database",
      ".txt",
      [user1],
      [],
      []
    );
    await FileCtrl.$withUser("Test").RemoveClinicianFromFile("2abcd", user1);
    const output = await FileCtrl.GetByIdFromUser("1") as File[];
    console.log("Output of Query ", output);
    expect(output.length === 2).to.be.true;
  });
});