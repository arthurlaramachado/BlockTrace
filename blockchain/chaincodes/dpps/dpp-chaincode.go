package main

import (
	"encoding/json" // encode/decode JSON (marshall / unmarshall)
	"fmt"           // formatting text, logs, prints and debugs
	"os"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi" // Hyperledger Fabric Contract API donwloaded through Go Modules
)

// SmartContract provides functions for managing assets
type SmartContract struct {
	contractapi.Contract
}

func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	fileData, err := os.ReadFile("./dpp_mocked.json")
	if err != nil {
		return fmt.Errorf("error reading JSON: %v", err)
	}

	var dpps []DPP

	if err := json.Unmarshal(fileData, &dpps); err != nil { // translates json to DPP struct
		return fmt.Errorf("error unmarshalling JSON: %v", err)
	}

	for _, dpp := range dpps {
		dppJSON, err := json.Marshal(dpp)
		if err != nil {
			return err
		}

		err = ctx.GetStub().PutState(dpp.DPPID, dppJSON)
		if err != nil {
			return fmt.Errorf("failed to put to world state. %v", err)
		}
	}

	return nil
}

// DPPExists returns true when DPP with given ID exists in world state
func (s *SmartContract) DPPExists(ctx contractapi.TransactionContextInterface, dpp_id string) (bool, error) {
	dppJSON, err := ctx.GetStub().GetState(dpp_id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}

	return dppJSON != nil, nil
}

// CreateDPP issues a new DPP to the world state with given details.
func (s *SmartContract) CreateDPP(
	ctx contractapi.TransactionContextInterface,
	dpp_id string,
	owner_did string,
	serial_number string,
	status string,
	//lifecycle LifecycleData,
	permissions []string,
	product_name string,
	components []string,
	audit_log AuditLogEntry,
	updated_at time.Time,
) error {
	exists, err := s.DPPExists(ctx, dpp_id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("the DPP %s already exists", dpp_id)
	}

	dpp := DPP{
		DPPID:        dpp_id,
		OwnerDID:     owner_did,
		SerialNumber: serial_number,
		Status:       status,
		//Lifecycle:    lifecycle,
		Permissions: permissions,
		ProductName: product_name,
		Components:  components,
		AuditLog:    []AuditLogEntry{audit_log},
		UpdatedAt:   updated_at,
	}

	dppJSON, err := json.Marshal(dpp)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(dpp_id, dppJSON)
}

// ReadDPP returns the DPP stored in the world state with given id.
func (s *SmartContract) ReadDPP(ctx contractapi.TransactionContextInterface, dpp_id string) (*DPP, error) {
	dppJSON, err := ctx.GetStub().GetState(dpp_id)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if dppJSON == nil {
		return nil, fmt.Errorf("the DPP %s does not exist", dpp_id)
	}

	var dpp DPP
	err = json.Unmarshal(dppJSON, &dpp)
	if err != nil {
		return nil, err
	}

	return &dpp, nil
}

// UpdateDPP updates an existing DPP in the world state with provided parameters.
func (s *SmartContract) UpdateDPP(
	ctx contractapi.TransactionContextInterface,
	dpp_id string,
	owner_did string,
	serial_number string,
	status string,
	//lifecycle LifecycleData,
	permissions []string,
	product_name string,
	components []string,
	audit_log AuditLogEntry,
	updated_at time.Time,
) error {
	exists, err := s.DPPExists(ctx, dpp_id)
	if err != nil {
		return err
	}
	if !exists {
		return fmt.Errorf("the DPP %s does not exist", dpp_id)
	}

	// overwriting original DPP with new DPP
	dpp := DPP{
		DPPID:        dpp_id,
		OwnerDID:     owner_did,
		SerialNumber: serial_number,
		Status:       status,
		//Lifecycle:    lifecycle,
		Permissions: permissions,
		ProductName: product_name,
		Components:  components,
		AuditLog:    []AuditLogEntry{audit_log},
		UpdatedAt:   updated_at,
	}

	dppJSON, err := json.Marshal(dpp)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(dpp_id, dppJSON)
}

// DeleteDPP deletes an given DPP from the world state.
func (s *SmartContract) DeleteDPP(ctx contractapi.TransactionContextInterface, dpp_id string) error {
	exists, err := s.DPPExists(ctx, dpp_id)
	if err != nil {
		return err
	}
	if !exists {
		return fmt.Errorf("the DPP %s does not exist", dpp_id)
	}

	return ctx.GetStub().DelState(dpp_id)
}

// GetAllDPPs returns all DPPs found in world state
func (s *SmartContract) GetAllDPPs(ctx contractapi.TransactionContextInterface) ([]*DPP, error) {
	// range query with empty string for startKey and endKey does an
	// open-ended query of all DPPs in the chaincode namespace.
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var dpps []*DPP
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var dpp DPP
		err = json.Unmarshal(queryResponse.Value, &dpp)
		if err != nil {
			return nil, err
		}
		dpps = append(dpps, &dpp)
	}

	return dpps, nil
}

// Get all DPPs from owner_id
func (s *SmartContract) GetAllDPPsByOwnerDID(ctx contractapi.TransactionContextInterface, owner_did string) ([]*DPP, error) {
	query := fmt.Sprintf(`{
		"selector": {
			"owner_did": "%s"
		}
	}`, owner_did)

	resultsIterator, err := ctx.GetStub().GetQueryResult(query)

	if err != nil {
		return nil, fmt.Errorf("failed to query DPPs by owner_did: %v", err)
	}

	defer resultsIterator.Close()

	var dpps []*DPP

	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var dpp DPP
		if err := json.Unmarshal(queryResponse.Value, &dpp); err != nil {
			return nil, err
		}
		dpps = append(dpps, &dpp)
	}

	return dpps, nil
}
