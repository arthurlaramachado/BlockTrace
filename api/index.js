import express from 'express'
import 'dotenv/config'
import dppRoutes from './routes/dppRoutes.js'

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/dpp', dppRoutes);

app.listen(PORT, () => {
  console.log(`API simples rodando em http://localhost:${PORT}`);
});
