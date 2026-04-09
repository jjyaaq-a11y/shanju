import crypto from "node:crypto";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

function resolveDatabasePath() {
  const databaseUrl = process.env.DATABASE_URL || "file:./payload.db";

  if (!databaseUrl.startsWith("file:")) {
    throw new Error(`Unsupported DATABASE_URL for sqlite test setup: ${databaseUrl}`);
  }

  const filePath = databaseUrl.slice("file:".length);

  if (filePath.startsWith("/")) {
    return filePath;
  }

  return filePath.replace(/^\.\//, "") || "payload.db";
}

function escapeSql(value: string) {
  return value.replace(/'/g, "''");
}

function generatePasswordHash(password: string) {
  const salt = crypto.randomBytes(32).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 25000, 512, "sha256").toString("hex");

  return { salt, hash };
}

function main() {
  const email = process.env.TEST_ADMIN_EMAIL || "routes-api-test@example.com";
  const password = process.env.TEST_ADMIN_PASSWORD || "TestPassword123!";
  const name = process.env.TEST_ADMIN_NAME || "Routes API Test Admin";
  const dbPath = resolveDatabasePath();
  const now = new Date().toISOString();
  const { salt, hash } = generatePasswordHash(password);

  const escapedEmail = escapeSql(email);
  const escapedName = escapeSql(name);
  const escapedNow = escapeSql(now);
  const escapedSalt = escapeSql(salt);
  const escapedHash = escapeSql(hash);

  const existingId = execFileSync(
    "sqlite3",
    [dbPath, `select id from users where email='${escapedEmail}' limit 1;`],
    { encoding: "utf8" },
  ).trim();

  const sql = existingId
    ? `
update users
set
  email='${escapedEmail}',
  name='${escapedName}',
  updated_at='${escapedNow}',
  salt='${escapedSalt}',
  hash='${escapedHash}',
  login_attempts=0,
  lock_until=null,
  reset_password_token=null,
  reset_password_expiration=null
where id=${existingId};
`
    : `
insert into users (
  name,
  updated_at,
  created_at,
  email,
  reset_password_token,
  reset_password_expiration,
  salt,
  hash,
  login_attempts,
  lock_until
) values (
  '${escapedName}',
  '${escapedNow}',
  '${escapedNow}',
  '${escapedEmail}',
  null,
  null,
  '${escapedSalt}',
  '${escapedHash}',
  0,
  null
);
`;

  execFileSync("sqlite3", [dbPath, sql], { encoding: "utf8" });

  const verify = execFileSync(
    "sqlite3",
    [dbPath, `select id,email,name from users where email='${escapedEmail}' limit 1;`],
    { encoding: "utf8" },
  ).trim();

  assert.ok(verify.includes(email), "failed to verify prepared admin user");

  console.log(`PASS: prepared test admin ${email} in ${dbPath}`);
}

main();
