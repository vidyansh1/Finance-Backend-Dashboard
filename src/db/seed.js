const User = require("../models/User");
const Record = require("../models/Record");
const { seedUsers, seedRecords } = require("../lib/seedData");

async function seedDatabase() {
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    return;
  }

  const insertedUsers = await User.insertMany(seedUsers);
  const userByEmail = new Map(insertedUsers.map((user) => [user.email, user]));

  await Record.insertMany(
    seedRecords.map((record) => ({
      amount: record.amount,
      type: record.type,
      category: record.category,
      date: record.date,
      notes: record.notes,
      createdBy: userByEmail.get(record.createdByEmail)._id
    }))
  );
}

module.exports = {
  seedDatabase
};
