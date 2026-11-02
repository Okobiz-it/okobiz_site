import mongoose, { Schema } from "mongoose";

export interface IHeroSlide {
  _id: string;
  title: string;
  img: string;
  order: number;
  isActive: boolean;
  buttonText: string;
  buttonLink: string;
}

const HeroSlideSchema = new Schema<IHeroSlide>({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  title: { type: String, required: true },
  img: { type: String, required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  buttonText: { type: String, default: "More Information" },
  buttonLink: { type: String, default: "/contact-us" }
});

export default mongoose.models.HeroSlide || mongoose.model<IHeroSlide>("HeroSlide", HeroSlideSchema);
