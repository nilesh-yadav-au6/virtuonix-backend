import mongoose, { Document, Schema } from "mongoose";

// Define the interface for the User model
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  profession: "Engineer" | "Doctor"; // Profession options
  token: string;
}

// Create the schema
const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  profession: { type: String, enum: ["Engineer", "Doctor"], required: true },
  token: { type: String, required: false },
});

// Export the User model
export default mongoose.model<IUser>("User", UserSchema);
