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

  it("should create a default model", async () => {
    const modelSample = new User({
      id: uuid(),
      name: "Test",
      created: new Date(),
      typeUser: "doctor",
      // TODO: Randomise
      PublicKey: "34333533453",
    });

    await UserCtrl.$withUser("Test").create(modelSample);

    const justSavedModel = await adapter.getById<User>(modelSample.id);

    expect(justSavedModel.id).to.exist;
  });
  it("should create a model with the given name", async () => {
    const modelSample = await UserCtrl.$withUser("Test").generate(
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