import { Request, Response, NextFunction } from "express";
import Category from "../models/category.model";
import Product from "../models/product.model";
import { AuthRequest } from "../types/request.type";

//List all products
export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find()
      .select("name images rentalPrice available categoryId storeId size") // chỉ lấy trường cần thiết
      .populate("categoryId", "name") // chỉ lấy tên category
      .populate("storeId", "username storeInfo"); // chỉ lấy tên store và info
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};
//List products of store
export const getProductOfStore = async (req: AuthRequest, res: Response) => {
  const storeId = req.params.id;
  const products = await Product.findById(storeId);
  res.status(200).json(products);
};
//Update product
export const updateProduct = async (req: AuthRequest, res: Response) => {
  const productId = req.params.id;
  const product = await Product.findByIdAndUpdate(productId, req.body, {
    new: true,
  });
  res.status(200).json(product);
};
//Delete product
export const deleteProduct = async (req: AuthRequest, res: Response) => {
  const productId = req.params.id;
  await Product.findByIdAndDelete(productId);
  res.status(200).json({ message: "Product deleted successfully" });
};
//Create product
export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, images, category, size } = req.body;
    const product = new Product({
      storeId: req.user.id,
      name,
      description,
      price,
      images,
      category,
      size,
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to create product", error: err });
  }
};
