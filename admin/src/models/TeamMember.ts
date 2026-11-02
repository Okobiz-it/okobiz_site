import mongoose, { Schema } from "mongoose";

export interface ITeamMember {
  _id: string;
  name: string;
  designation: string;
  image: string;
  type: "team" | "advisor";
  order: number;
}

const TeamMemberSchema = new Schema<ITeamMember>({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  designation: { type: String, required: true },
  image: { type: String, required: true },
  type: { type: String, enum: ["team", "advisor"], default: "team" },
  order: { type: Number, default: 0 }
});

export default mongoose.models.TeamMember || mongoose.model<ITeamMember>("TeamMember", TeamMemberSchema);
