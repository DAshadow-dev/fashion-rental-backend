import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/error.middleware';
import authRoutes from './routes/auth.route';
import userRoutes from './routes/user.route';
import path from 'path';
import productRoutes from './routes/product.route';
import rentalRoutes from './routes/rental.route';
import storeRoutes from './routes/store.route';
import payosRoutes from './routes/payos.route';
import paymentRoutes from './routes/payment.route';
import passport from 'passport';
import session from 'express-session';
const app = express();
    
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/stores', storeRoutes);
app.use("/api/payos", payosRoutes);
app.use('/api/payments', paymentRoutes);
app.get('/', (_req, res) => {
  res.send('Fashion Rental API is running');
});
app.use(errorHandler);
export default app;

