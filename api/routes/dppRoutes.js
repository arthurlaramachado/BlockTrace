import express from 'express';
import { TextDecoder } from 'node:util';
import { getContractInstance } from '../src/getContractInstance.js'; // sua função de conexão modular
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const utf8Decoder = new TextDecoder();

router.get('/getAllDPPs', async (req, res) => {
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

router.get('/getAllDPPsByOwnerDID', async (req, res) => {
    const owner_did = req.query.owner_did

    try {
        const contract = await getContractInstance();

        const resultBytes = await contract.evaluateTransaction('GetAllDPPsByOwnerDID', owner_did);
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

router.get('/readDPP', async (req, res) => {
    const dpp_id = req.query.dpp_id

    try {
        const contract = await getContractInstance();

        const resultBytes = await contract.evaluateTransaction('ReadDPP', dpp_id);
        const resultJson = utf8Decoder.decode(resultBytes);
        const result = JSON.parse(resultJson);

        console.log(result)

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

router.post('/transferDPP', async (req, res) => {
    const { dpp_id, new_owner_did, original_message, signed_base64, public_key_base64 } = req.body;

    try {
        const contract = await getContractInstance();

        // Simplesmente envia tudo para a chaincode
        await contract.submitTransaction(
            'TransferDPPWithSignature',
            dpp_id,
            new_owner_did,
            original_message,
            signed_base64,
            public_key_base64
        );

        res.status(200).json({ success: true, message: 'DPP transferred successfully' });
    } catch (error) {
        console.error('Error during DPP transfer:', error);
        res.status(500).json({
            success: false,
            message: 'Error during DPP transfer',
            error: error.message || error.toString(),
        });
    }
});

router.post('/createDPP', async (req, res) => {
    try {
        const dpp = req.body
        const { original_message, signed_base64, public_key_base64 } = req.body
        const contract = await getContractInstance();
        const dpp_id = uuidv4();

        await contract.submitTransaction(
            'CreateDPPWithSignature',
            dpp_id,
            dpp.owner_did,
            dpp.serial_number,
            dpp.status,
            JSON.stringify(dpp.permissions),
            dpp.product_name,
            JSON.stringify(dpp.components),
            original_message, 
            signed_base64, 
            public_key_base64
        );

        res.status(200).json({ success: true, message: 'DPP created successfully' });
    } catch (error) {
        console.error('Error creating DPP:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating DPP',
            error: error.message || error.toString(),
        });
    }
});

router.post('/editDPP', async (req, res) => {
    try {
        const dpp = req.body
        const { original_message, signed_base64, public_key_base64 } = req.body
        const contract = await getContractInstance();

        await contract.submitTransaction(
            'UpdateDPPWithSignature',
            dpp.dpp_id,
            dpp.owner_did,
            dpp.serial_number,
            dpp.status,
            JSON.stringify(dpp.permissions),
            dpp.product_name,
            JSON.stringify(dpp.components),
            original_message, 
            signed_base64, 
            public_key_base64
        );

        res.status(200).json({ success: true, message: 'DPP updated successfully' });
    } catch (error) {
        console.error('Error updating DPP:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating DPP',
            error: error.message || error.toString(),
        });
    }
});

export default router;
