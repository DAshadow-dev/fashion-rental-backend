import mongoose from 'mongoose';
import User from '../models/user.model';
import bcrypt from 'bcrypt';
import Product from '../models/product.model';
import Rental from '../models/rental.model';
import Payment from '../models/payment.model';

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Rental.deleteMany({});
    await Payment.deleteMany({});

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '1234567890',
      address: '123 Admin Street'
    });

    const store1 = await User.create({
      username: 'fashionstore',
      email: 'store1@example.com',
      password: hashedPassword,
      role: 'STORE',
      storeInfo: {
        storeName: 'Fashion Forward',
        description: 'Your one-stop shop for trendy fashion rentals',
        logoUrl: 'https://example.com/logo1.jpg',
        featured: true
      },
      phone: '2345678901',
      address: '456 Store Street'
    });

    const customer1 = await User.create({
      username: 'johndoe',
      email: 'john@example.com',
      password: hashedPassword,
      role: 'CUSTOMER',
      phone: '3456789012',
      address: '789 Customer Street'
    });
    // Create sample products
    const products = await Product.create([
      {
        storeId: store1._id,
        name: 'Black Evening Gown',
        description: 'Elegant black evening gown perfect for formal events',
        category: 'Tops',
        size: 'M',
        rentalPrice: 50,
        depositPrice: 200,
        images: ['https://example.com/gown1.jpg', 'https://example.com/gown2.jpg'],
        available: true
      },
      {
        storeId: store1._id,
        name: 'Business Suit',
        description: 'Classic black business suit for professional meetings',
        category: "Outerwear",
        size: 'L',
        rentalPrice: 40,
        depositPrice: 150,
        images: ['https://example.com/suit1.jpg'],
        available: true
      }
    ]);

    // Create sample rentals
    await Rental.create([
      {
        productId: products[0]._id,
        customerId: customer1._id,
        storeId: store1._id,
        rentalStart: new Date('2024-03-20'),
        rentalEnd: new Date('2024-03-25'),
        totalPrice: 250,
        depositPaid: true,
        status: 'APPROVED'
      }
    ]);


    const rental = await Rental.findOne({ customerId: customer1._id });
    if (!rental) {
      throw new Error('Rental not found for customer1');
    }
    await Payment.create([
      {
        rentalId: rental._id,
        amount: 250,
        paymentMethod: 'CREDIT_CARD',
        status: 'COMPLETED',
        transactionId: 'txn_1234567890',
        orderCode: 1001,
        paymentUrl: 'https://example.com/payment/1001'
      }
    ]);
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

export default seedDatabase;