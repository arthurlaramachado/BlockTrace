import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import dppRoutes from './routes/dppRoutes.js'

const app = express();
const PORT = process.env.PORT;

app.use(cors({
  origin:'*' // port that is running the front-end
}))
app.use(express.json());
app.use('/dpp', dppRoutes);

app.listen(PORT, () => {
  console.log(`API simples rodando em http://localhost:${PORT}`);
});
