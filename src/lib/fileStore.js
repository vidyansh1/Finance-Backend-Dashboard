const fs = require("fs/promises");
const path = require("path");
const { DATA_DIR } = require("../config");

async function ensureCollection(name, seedData = []) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const filePath = path.join(DATA_DIR, `${name}.json`);

  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(seedData, null, 2));
  }

  return filePath;
}

async function readCollection(name, seedData = []) {
  const filePath = await ensureCollection(name, seedData);
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw || "[]");
}

async function writeCollection(name, data, seedData = []) {
  const filePath = await ensureCollection(name, seedData);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  return data;
}

module.exports = {
  ensureCollection,
  readCollection,
  writeCollection
};
