import { getContractInstance } from '../src/getContractInstance.js'; // sua função de conexão modular
import express from 'express';
import { TextDecoder } from 'node:util';

const router = express.Router();
const utf8Decoder = new TextDecoder();

//getAllDPPs
router.get('/dpps', async (req, res) => {
    try {
        const contract = await getContractInstance(); 

        const resultBytes = await contract.evaluateTransaction('GetAllDPPs');
        const resultJson = utf8Decoder.decode(resultBytes);
        const result = JSON.parse(resultJson);

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Error while looking for DPPs:', error);
        res.status(500).json({
            success: false,
            message: 'Error while looking for DPPs',
            error: error.message || error.toString(),
        });
    }
});

export default router;
