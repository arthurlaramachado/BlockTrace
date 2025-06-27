package main

import "time"

// TODO - FIX LIFECYCLE DATA

type DPP struct {
	AuditLog   []AuditLogEntry `json:"audit_log"`
	Components []string        `json:"components"`
	DPPID      string          `json:"dpp_id"`
	//Lifecycle    LifecycleData       `json:"lifecycle"`
	OwnerDID     string    `json:"owner_did"`
	Permissions  []string  `json:"permissions"`
	ProductName  string    `json:"product_name"`
	SerialNumber string    `json:"serial_number"`
	Status       string    `json:"status"`
	UpdatedAt    time.Time `json:"updated_at"`
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
