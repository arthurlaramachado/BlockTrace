import React, { useState } from 'react';
import { Popover, TextField, Button, Typography, Box } from '@mui/material';
import { SwapHoriz } from '@mui/icons-material';

export default function TransferDPPButton({ onTransfer }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [targetDID, setTargetDID] = useState('');

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setTargetDID('');
  };

  const handleTransfer = () => {
    if (onTransfer) {
      onTransfer(targetDID);
    }
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'transfer-popover' : undefined;

  return (
    <>
      <Button
        variant="outlined"
        color="success"
        aria-describedby={id} 
        startIcon={<SwapHoriz />}
        onClick={handleClick}>
        Transfer
      </Button>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, width: 300 }}>
          <Typography variant="h6">Transfer DPP</Typography>
          <TextField
            label="New Owner DID"
            value={targetDID}
            onChange={(e) => setTargetDID(e.target.value)}
            fullWidth
          />
          <Button variant="contained" color="primary" onClick={handleTransfer}>
            Confirm Transfer
          </Button>
        </Box>
      </Popover>
    </>
  );
}
