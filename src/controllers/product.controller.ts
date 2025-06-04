import { Request, Response, NextFunction } from "express";
import Product from "../models/product.model";
import { AuthRequest } from "../types/request.type";
import Rental from "../models/rental.model";

//List all products
export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find()
      .select("name images rentalPrice available category storeId size") // chỉ lấy trường cần thiết
      .populate("storeId", "username storeInfo"); // chỉ lấy tên store và info
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};
//List products of store
export const getProductOfStore = async (req: AuthRequest, res: Response) => {
  const storeId = req.params.storeId;
  try {
    const products = await Product.find({ storeId })
      .select("name images rentalPrice available category size")
      .populate("storeId", "username storeInfo");
    if (products.length === 0) {
       res.status(404).json({ message: "No products found for this store" });
      return;
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error: error });
  }
};
//Get product by ID
export const getProductById = async (req: AuthRequest, res: Response) => {
  const productId = req.params.productId;
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }
  res.status(200).json(product);
}
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
// Get available dates for a product
export const getUnavailableDates = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const rentals = await Rental.find({
      productId,
      status: { $in: ["APPROVED"] },
    }).select("rentalStart rentalEnd");

    const unavailableRanges = rentals.map((r) => ({
      start: r.rentalStart.toISOString().split("T")[0],
      end: r.rentalEnd.toISOString().split("T")[0],
    }));

    res.status(200).json(unavailableRanges);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy ngày không khả dụng", error });
  }
};

