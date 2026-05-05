import { User, UserRole } from "../models/user.model";

const DEFAULT_ADMIN_UUID = "0";

const ensureDefaultAdmin = async () => {
  const admin = await User.findOne({ role: UserRole.ADMIN });
  if (admin) {
    return;
  }

  await User.create({
    email: process.env.DEFAULT_ADMIN_EMAIL || "admin@crm.local",
    role: UserRole.ADMIN,
    uuid: process.env.DEFAULT_ADMIN_UUID || DEFAULT_ADMIN_UUID,
    password: process.env.DEFAULT_ADMIN_PASSWORD || "admin@123",
    cred: {
      fullName: process.env.DEFAULT_ADMIN_NAME || "CRM Admin",
      department: "Management",
      designation: "Administrator",
      phoneNo: "",
    },
    status: "active",
  });
};

export default ensureDefaultAdmin;
