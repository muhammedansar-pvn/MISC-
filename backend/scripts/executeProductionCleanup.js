require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");

async function executeCleanup() {
  const manifestPath = path.resolve(__dirname, "cleanup_manifest.json");
  if (!fs.existsSync(manifestPath)) {
    console.error("Cleanup manifest not found! Run generateCleanupManifest.js first.");
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const toDelete = manifest.proposedForDeletion;

  console.log(`Loaded manifest with ${toDelete.length} records proposed for deletion.`);

  await connectDB();
  const db = mongoose.connection.db;

  // 1. Group target IDs by collection
  const byCollection = {};
  for (const item of toDelete) {
    if (!byCollection[item.collection]) {
      byCollection[item.collection] = [];
    }
    byCollection[item.collection].push(new mongoose.Types.ObjectId(item.id));
  }

  // 2. BACKUP: export exact documents to be deleted before performing deletion
  const backup = {};
  for (const [coll, ids] of Object.entries(byCollection)) {
    const docs = await db.collection(coll).find({ _id: { $in: ids } }).toArray();
    backup[coll] = docs;
    console.log(`Backing up ${docs.length} documents from ${coll}...`);
  }

  const backupPath = path.resolve(__dirname, "deleted_records_backup.json");
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2), "utf8");
  console.log(`\nAll deleted records backed up securely to: ${backupPath}\n`);

  // 3. EXECUTE TARGETED DELETION
  const deletionResults = {};
  for (const [coll, ids] of Object.entries(byCollection)) {
    const res = await db.collection(coll).deleteMany({ _id: { $in: ids } });
    deletionResults[coll] = res.deletedCount;
    console.log(`Deleted ${res.deletedCount} documents from ${coll}`);
  }

  // 4. VERIFICATION: Ensure all preserved records still exist intact
  console.log("\n--- VERIFYING PRESERVED RECORDS ---");
  let preservedIntact = 0;
  let preservedMissing = 0;

  for (const item of manifest.preservedRecords) {
    const exists = await db.collection(item.collection).findOne({
      _id: new mongoose.Types.ObjectId(item.id)
    });
    if (exists) {
      preservedIntact++;
    } else {
      preservedMissing++;
      console.error(`CRITICAL: Preserved record missing! ${item.collection}:${item.id} (${item.identifier})`);
    }
  }

  console.log(`Preserved records intact: ${preservedIntact}/${manifest.preservedRecords.length}`);
  if (preservedMissing > 0) {
    console.error(`ERROR: ${preservedMissing} preserved records were lost! Check backup.`);
    process.exit(1);
  }

  console.log("\n=== POST-CLEANUP COLLECTION COUNTS ===");
  const postCounts = {};
  for (const collName of Object.keys(manifest.summary)) {
    const count = await db.collection(collName).countDocuments();
    postCounts[collName] = count;
  }
  console.table(postCounts);

  console.log("\nSUCCESS: Production database cleanup completed safely and verified!");
  await mongoose.disconnect();
}

executeCleanup().catch(err => {
  console.error("Cleanup error:", err);
  process.exit(1);
});
