// tslint:disable:no-unused-expression
import { join } from 'path';
import { expect } from 'chai';
import * as uuid from 'uuid/v4';
import { MockControllerAdapter } from '@worldsibu/convector-adapter-mock';
import { ClientFactory, ConvectorControllerClient } from '@worldsibu/convector-core';
import 'mocha';

import { User, UserController } from '../src';

describe("User", () => {
  let adapter: MockControllerAdapter;
  let UserCtrl: ConvectorControllerClient<UserController>;

  before(async () => {
    // Mocks the blockchain execution environment
    adapter = new MockControllerAdapter();
    UserCtrl = ClientFactory(UserController, adapter);

    await adapter.init([
      {
        version: "*",
        controller: "UserController",
        name: join(__dirname, "..")
      }
    ]);

    adapter.addUser("Test");

  });
  it("should create a model with the given name", async () => {
    const modelSample = await UserCtrl.$withUser("Test").Generate(
      "333",
      "it's incredible",
      "SECRET-KEY",
      "doctor"
    );
    const modelT = modelSample as any;
    const justSavedModel = await adapter.getById<User>(modelT._id);
    expect(justSavedModel.id).to.exist;
  });
});