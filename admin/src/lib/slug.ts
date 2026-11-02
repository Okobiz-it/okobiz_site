import slugify from "slugify";

export function createSlug(text: string): string {
  if (!text) return "";
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
    remove: /[*+~.()'"!:@]/g,
  });
}

export default createSlug;

