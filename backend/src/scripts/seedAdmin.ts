// Creates the first admin, or promotes an existing user to admin.
// Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run seed:admin   (or set them in .env)
import { z } from "zod";
import { ROLES } from "../constants.js";
import { connectDB, disconnectDB } from "../db/connect.js";
import { UserModel } from "../models/user.model.js";
import { hashPassword } from "../utils/password.js";
import { newPassword } from "../validators/auth.validator.js";

const schema = z.object({
  ADMIN_NAME: z.string().trim().min(2).max(50).default("Admin"),
  ADMIN_EMAIL: z.string().trim().toLowerCase().pipe(z.email()),
  ADMIN_PASSWORD: newPassword,
});

async function main() {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    console.error(
      "Invalid admin seed config:",
      z.flattenError(parsed.error).fieldErrors
    );
    process.exit(1);
  }
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = parsed.data;

  await connectDB();
  try {
    const existing = await UserModel.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      // existing password is left untouched
      existing.role = ROLES.ADMIN;
      existing.isActive = true;
      await existing.save();
      console.log(`Promoted existing user ${ADMIN_EMAIL} to admin`);
    } else {
      await UserModel.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: await hashPassword(ADMIN_PASSWORD),
        role: ROLES.ADMIN,
      });
      console.log(`Created admin ${ADMIN_EMAIL}`);
    }
  } finally {
    await disconnectDB();
  }
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
