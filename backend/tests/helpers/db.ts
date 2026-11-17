import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { afterAll, afterEach, beforeAll } from "vitest";

// Spins up an in-memory MongoDB for the test file that calls this
export function useTestDatabase() {
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    // make sure unique indexes exist before tests rely on them
    await Promise.all(
      Object.values(mongoose.models).map((model) => model.init())
    );
  });

  afterEach(async () => {
    await Promise.all(
      Object.values(mongoose.connection.collections).map((c) =>
        c.deleteMany({})
      )
    );
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo?.stop();
  });
}
