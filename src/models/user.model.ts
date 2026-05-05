import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt, { Secret, SignOptions } from "jsonwebtoken";

export enum UserRole {
  ADMIN = "admin",
  MEMBER = "member",
}

export interface UserDocument extends Document {
  email: string;
  uuid: string;
  role: UserRole;
  password: string;
  refreshToken: string;
  cred: {
    fullName: string;
    phoneNo?: string;
    department?: string;
    designation?: string;
  };
  status: "active" | "inactive";
  isPasswordCorrect: (password: string) => Promise<boolean>;
  generateAccessToken: () => string;
  generateRefreshToken: () => string;
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, trim: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
      default: UserRole.MEMBER,
    },
    uuid: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    refreshToken: { type: String, default: "" },
    cred: {
      fullName: { type: String, required: true, trim: true },
      phoneNo: { type: String, default: "" },
      department: { type: String, default: "" },
      designation: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.isPasswordCorrect = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  const secret: Secret = process.env.ACCESS_TOKEN_SECRET || "secret";
  const options: SignOptions = { expiresIn: "1d" };
  return jwt.sign(
    {
      _id: this._id,
      uuid: this.uuid,
      role: this.role,
    },
    secret,
    options,
  );
};

userSchema.methods.generateRefreshToken = function () {
  const secret: Secret = process.env.REFRESH_TOKEN_SECRET || "secret";
  const options: SignOptions = {
    expiresIn: (process.env.REFRESH_TOKEN_EXPIRY || "7d") as SignOptions["expiresIn"],
  };
  return jwt.sign(
    { _id: this._id },
    secret,
    options,
  );
};

export const User = mongoose.model<UserDocument>("User", userSchema);
