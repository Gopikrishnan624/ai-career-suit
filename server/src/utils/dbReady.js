import mongoose from 'mongoose';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function waitForMongoConnection(timeoutMs = 3000) {
  if (mongoose.connection.readyState === 1) return true;
  if (mongoose.connection.readyState !== 2) return false;

  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (mongoose.connection.readyState === 1) return true;
    await sleep(100);
  }

  return mongoose.connection.readyState === 1;
}

