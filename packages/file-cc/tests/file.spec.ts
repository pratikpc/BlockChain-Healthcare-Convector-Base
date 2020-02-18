// tslint:disable:no-unused-expression
import { join } from 'path';
import { expect } from 'chai';
import { MockControllerAdapter } from '@worldsibu/convector-adapter-mock';
import { ClientFactory, ConvectorControllerClient } from '@worldsibu/convector-core';
import 'mocha';

import { File, FileController } from '../src';

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
    const modelSample = {
      id: "213",
      Hash: "4",
      Viewer: ["4"],
      Recipient: ["4"],
      Uploader: ["4"],
      extension: "ext",
      IPFS: "555",
      // created: new Date()
    };

    const file = await FileCtrl.$withUser("Test").Create(modelSample.id, modelSample.IPFS, modelSample.Hash, modelSample.extension, modelSample.Recipient, modelSample.Uploader, modelSample.Viewer);

    const justSavedModel = await adapter.getById<File>(modelSample.id);

    expect(justSavedModel.id).to.exist;
  });
  it("Check if After Multiple Inserts, we can get the Data we want", async () => {
    const user1 = "1";
    const user2 = "2";
    const user3 = "3";
    await FileCtrl.$withUser("Test").Create(
      "1abcd",
      "null",
      "1this is the data to be added to a database",
      ".txt",
      [user1, user2],
      [],
      [user3]
    );
    await FileCtrl.$withUser("Test").Create(
      "2abcd",
      "null",
      "this is the data to be added to a database",
      ".txt",
      [user2],
      [user1],
      []
    );
    await FileCtrl.$withUser("Test").Create(
      "3abcd",
      "null",
      "this is the data to be added to a database",
      ".txt",
      [user1],
      [user3],
      []
    );
    await FileCtrl.$withUser("Test").RemoveUploaderFromFile("2abcd", user1);
    const output = await FileCtrl.GetFilesByIdFromUser(user1);
    expect(output.length === 2).to.be.true;
  });
});