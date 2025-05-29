import mongoose from "mongoose";
import { ICategory } from "../types/category.type";

const CategorySchema = new mongoose.Schema<ICategory>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
}, { timestamps: true });

const Category = mongoose.model<ICategory>("Category", CategorySchema);
export default Category;

