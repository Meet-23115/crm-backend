import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export interface UserDocument extends Document {
  email: string;
  uuid: string;
  role: string;
  password: string;
  refreshToken: string;
  team: mongoose.Schema.Types.ObjectId[];
  cred: {
    fullName?: string;
    phoneNo?: string;
    department?: string;
    designation?: string;
    gender?: string;
    dob?: Date;
    nationality?: string;
    maritalStatus?: string;
    profilePic?: string;
  };
  address?: {
    current?: string;
    permanent?: string;
  };
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  joinedAt?: Date;
  lastLogin?: Date;
  reportingManagerId?: mongoose.Schema.Types.ObjectId;
  status?: string;
  totalLeaves?: number;
  leavesTaken?: number;
  location?: string;

  // Payroll
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    pan?: string;
    uan?: string;
  };
  salaryHistory?: Array<{
    amount: number;
    effectiveFrom: Date;
  }>;
  payslips?: Array<{
    month: string;
    url: string;
  }>;

  // Performance
  projectsAssigned?: string[];
  lastAppraisalDate?: Date;
  performanceNotes?: string[];
  goals?: string[];

  // Documents
  documents?: {
    resume?: string;
    offerLetter?: string;
    idProof?: string;
    otherDocs?: Array<{ name: string; description: string; url: string }>;
  };

  // System
  workEmail?: string;
  companyAssets?: string[];
  softwareAccess?: string[];

  isPasswordCorrect: (password: string) => Promise<boolean>;
  generateAccessToken: () => string;
  generateRefreshToken: () => string;
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true },
    role: { type: String, required: true },
    uuid: { type: String, required: true },
    password: { type: String, required: true },

    team: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
    ],

    refreshToken: { type: String, default: "" },

    cred: {
      fullName: { type: String },
      phoneNo: { type: String },
      department: { type: String, default: "" },
      designation: { type: String, default: "" },
      gender: { type: String },
      dob: { type: Date },
      nationality: { type: String },
      maritalStatus: { type: String },
      profilePic: { type: String },
    },

    address: {
      current: { type: String },
      permanent: { type: String },
    },

    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relationship: { type: String },
    },

    joinedAt: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: Date.now },
    reportingManagerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, default: "active" },
    totalLeaves: { type: Number, default: 20 },
    leavesTaken: { type: Number, default: 0 },
    location: { type: String },

    bankDetails: {
      bankName: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
      pan: { type: String },
      uan: { type: String },
    },

    salaryHistory: [
      {
        amount: { type: Number },
        effectiveFrom: { type: Date },
      },
    ],

    payslips: [
      {
        month: { type: String },
        url: { type: String },
      },
    ],

    projectsAssigned: [{ type: String }],
    lastAppraisalDate: { type: Date },
    performanceNotes: [{ type: String }],
    goals: [{ type: String }],

    documents: {
      resume: { type: String },
      offerLetter: { type: String },
      idProof: { type: String },
      otherDocs: [
        {
          name: { type: String, required: true },
          description: { type: String },
          url: { type: String, required: true },
        },
      ],
    },
    workEmail: { type: String },
    companyAssets: [{ type: String }],
    softwareAccess: [{ type: String }],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.isPasswordCorrect = async function (password: string) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (err) {
    console.error("Error comparing passwords:", err);
    throw err;
  }
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      uuid: this.uuid,
      password: this.password,
    },
    process.env.ACCESS_TOKEN_SECRET || "secret",
    { expiresIn: "1h" }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET || "secret",
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        ? parseInt(process.env.REFRESH_TOKEN_EXPIRY)
        : "7d",
    }
  );
};

export const User = mongoose.model<UserDocument>("User", userSchema);
