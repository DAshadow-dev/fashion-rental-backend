import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// Routes


app.get('/', (_req, res) => {
  res.send('Fashion Rental API is running');
});

export default app;

