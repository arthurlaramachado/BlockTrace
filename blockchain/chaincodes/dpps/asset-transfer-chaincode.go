package main

import (
	"encoding/json" // encode/decode JSON (marshall / unmarshall)
	"fmt"           // formatting text, logs, prints and debugs
	"os"

	"github.com/hyperledger/fabric-contract-api-go/contractapi" // Hyperledger Fabric Contract API donwloaded through Go Modules
)

// TODO - FIX LIFECYCLE DATA

// SmartContract provides functions for managing assets
type SmartContract struct {
	contractapi.Contract
}

type DPP struct {
	AuditLog   []AuditLogEntry `json:"audit_log"`
	Components []string        `json:"components"`
	DPPID      string          `json:"dpp_id"`
	//Lifecycle    LifecycleData       `json:"lifecycle"`
	OwnerDID     string              `json:"owner_did"`
	Permissions  map[string][]string `json:"permissions"`
	SerialNumber string              `json:"serial_number"`
	Status       string              `json:"status"`
}

type LifecycleData struct {
	LogisticsData     []LogisticsEntry     `json:"logistics_data"`
	MaintenanceData   []MaintenanceEntry   `json:"maintenance_data"`
	ManufacturingData []ManufacturingEntry `json:"manufacturing_data"`
	MaterialsData     []MaterialEntry      `json:"materials_data"`
	RecyclingData     []RecyclingEntry     `json:"recycling_data"`
	UsageData         []UsageEntry         `json:"usage_data"`
}

type LogisticsEntry struct {
	From   string `json:"from"`
	To     string `json:"to"`
	Status string `json:"status"`
}

type MaintenanceEntry struct {
	LastCheck string `json:"last_check,omitempty"`
	Status    string `json:"status,omitempty"`
}

type ManufacturingEntry struct {
	FactoryID string `json:"factory_id"`
	Date      string `json:"date"`
}

type MaterialEntry struct {
	MaterialType string `json:"material_type"`
	Origin       string `json:"origin"`
}

type RecyclingEntry struct {
	Recycled bool   `json:"recycled,omitempty"`
	Date     string `json:"date,omitempty"`
	Facility string `json:"facility,omitempty"`
}

type UsageEntry struct {
	FirstUse string `json:"first_use,omitempty"`
	LastUse  string `json:"last_use,omitempty"`
	Location string `json:"location,omitempty"`
}

type AuditLogEntry struct {
	Action    string `json:"action"`
	SignedBy  string `json:"signed_by"`
	Timestamp string `json:"timestamp"`
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
	permissions map[string][]string,
	components []string,
	audit_log AuditLogEntry,
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
		Components:  components,
		AuditLog:    []AuditLogEntry{audit_log},
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
	permissions map[string][]string,
	components []string,
	audit_log AuditLogEntry,
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
		Components:  components,
		AuditLog:    []AuditLogEntry{audit_log},
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

// TransferDPP updates the owner field of DPP with given id in world state.
func (s *SmartContract) TransferDPP(ctx contractapi.TransactionContextInterface, dpp_id string, new_owner_did string) error {
	dpp, err := s.ReadDPP(ctx, dpp_id)
	if err != nil {
		return err
	}

	dpp.OwnerDID = new_owner_did
	dppJSON, err := json.Marshal(dpp)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(dpp_id, dppJSON)
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
