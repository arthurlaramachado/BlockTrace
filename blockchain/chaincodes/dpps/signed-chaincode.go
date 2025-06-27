package main

import (
	"crypto/ed25519"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json" // encode/decode JSON (marshall / unmarshall)
	"fmt"           // formatting text, logs, prints and debugs
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi" // Hyperledger Fabric Contract API donwloaded through Go Modules
)

func (s *SmartContract) TransferDPPWithSignature(
	ctx contractapi.TransactionContextInterface,
	dpp_id string,
	new_owner_did string,
	original_message string,
	signed_base64 string,
	public_key_base64 string,
) error {
	dpp, err := s.ReadDPP(ctx, dpp_id)
	if err != nil {
		return err
	}

	if dpp.OwnerDID != public_key_base64 {
		return fmt.Errorf("unauthorized: not current owner")
	}

	if err := VerifySignature(original_message, signed_base64, public_key_base64); err != nil {
		return fmt.Errorf("signature verification failed: %v", err)
	}

	txTime, err := ctx.GetStub().GetTxTimestamp()
	if err != nil {
		return fmt.Errorf("failed to get tx timestamp: %v", err)
	}

	txTimestamp := time.Unix(txTime.Seconds, int64(txTime.Nanos)).UTC()

	dpp.OwnerDID = new_owner_did
	dpp.UpdatedAt = txTimestamp
	dpp.AuditLog = append(dpp.AuditLog, AuditLogEntry{
		Action:    "TRANSFER",
		SignedBy:  public_key_base64,
		Timestamp: txTimestamp.Format(time.RFC3339),
	})

	dppJSON, err := json.Marshal(dpp)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(dpp_id, dppJSON)
}

// CreateDPP issues a new DPP to the world state with given details.
func (s *SmartContract) CreateDPPWithSignature(
	ctx contractapi.TransactionContextInterface,
	dpp_id string,
	owner_did string,
	serial_number string,
	status string,
	//lifecycle LifecycleData,
	permissions []string,
	product_name string,
	components []string,
	original_message string,
	signed_base64 string,
	public_key_base64 string,
) error {
	exists, err := s.DPPExists(ctx, dpp_id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("the DPP %s already exists", dpp_id)
	}

	if err := VerifySignature(original_message, signed_base64, public_key_base64); err != nil {
		return fmt.Errorf("signature verification failed: %v", err)
	}

	txTime, err := ctx.GetStub().GetTxTimestamp()
	if err != nil {
		return fmt.Errorf("failed to get tx timestamp: %v", err)
	}

	txTimestamp := time.Unix(txTime.Seconds, int64(txTime.Nanos)).UTC()

	newAuditLog := AuditLogEntry{
		Action:    "CREATE",
		SignedBy:  public_key_base64,
		Timestamp: txTimestamp.Format(time.RFC3339),
	}

	dpp := DPP{
		DPPID:        dpp_id,
		OwnerDID:     owner_did,
		SerialNumber: serial_number,
		Status:       status,
		Permissions:  permissions,
		ProductName:  product_name,
		Components:   components,
		AuditLog:     []AuditLogEntry{newAuditLog},
		UpdatedAt:    txTimestamp,
	}

	dppJSON, err := json.Marshal(dpp)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(dpp_id, dppJSON)
}

func (s *SmartContract) UpdateDPPWithSignature(
	ctx contractapi.TransactionContextInterface,
	dpp_id string,
	owner_did string,
	serial_number string,
	status string,
	permissions []string,
	product_name string,
	components []string,
	original_message string,
	signed_base64 string,
	public_key_base64 string,
) error {
	exists, err := s.DPPExists(ctx, dpp_id)
	if err != nil {
		return err
	}
	if !exists {
		return fmt.Errorf("the DPP %s does not exist", dpp_id)
	}

	if err := VerifySignature(original_message, signed_base64, public_key_base64); err != nil {
		return fmt.Errorf("signature verification failed: %v", err)
	}

	dpp, err := s.ReadDPP(ctx, dpp_id)
	if err != nil {
		return err
	}

	txTime, err := ctx.GetStub().GetTxTimestamp()
	if err != nil {
		return fmt.Errorf("failed to get tx timestamp: %v", err)
	}
	txTimestamp := time.Unix(txTime.Seconds, int64(txTime.Nanos)).UTC()

	newAuditLog := AuditLogEntry{
		Action:    "UPDATE",
		SignedBy:  public_key_base64,
		Timestamp: txTimestamp.Format(time.RFC3339),
	}

	dpp.OwnerDID = owner_did
	dpp.SerialNumber = serial_number
	dpp.Status = status
	dpp.Permissions = permissions
	dpp.ProductName = product_name
	dpp.Components = components
	dpp.UpdatedAt = txTimestamp

	dpp.AuditLog = append(dpp.AuditLog, newAuditLog)

	dppJSON, err := json.Marshal(dpp)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(dpp_id, dppJSON)
}

// VerifySignature checks whether a base64-encoded signature is valid for a given base64 public key and message.
func VerifySignature(originalMessage, signedBase64, publicKeyBase64 string) error {
	pubKeyBytes, err := base64.StdEncoding.DecodeString(publicKeyBase64)
	if err != nil {
		return fmt.Errorf("failed to decode public key: %v", err)
	}

	sigBytes, err := base64.StdEncoding.DecodeString(signedBase64)
	if err != nil {
		return fmt.Errorf("failed to decode signature: %v", err)
	}

	hash := sha256.Sum256([]byte(originalMessage))
	if !ed25519.Verify(pubKeyBytes, hash[:], sigBytes) {
		return fmt.Errorf("invalid signature")
	}

	return nil
}
