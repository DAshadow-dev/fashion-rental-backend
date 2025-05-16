import { Request, Response } from 'express';
import { Product } from '../models/product.model';
import { AuthRequest } from '../types/request.type';

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
          size
        });
        await product.save();
        res.status(201).json(product);
      } catch (err) {
        res.status(500).json({ message: 'Failed to create product', error: err });
    }
}