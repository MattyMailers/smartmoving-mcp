// ============================================================================
// SmartMoving External API v1 - TypeScript Type Definitions
// ============================================================================
// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export var OpportunityStatus;
(function (OpportunityStatus) {
    OpportunityStatus[OpportunityStatus["NewLead"] = 0] = "NewLead";
    OpportunityStatus[OpportunityStatus["LeadInProgress"] = 1] = "LeadInProgress";
    OpportunityStatus[OpportunityStatus["Opportunity"] = 3] = "Opportunity";
    OpportunityStatus[OpportunityStatus["Booked"] = 4] = "Booked";
    OpportunityStatus[OpportunityStatus["Completed"] = 10] = "Completed";
    OpportunityStatus[OpportunityStatus["Closed"] = 11] = "Closed";
    OpportunityStatus[OpportunityStatus["Cancelled"] = 20] = "Cancelled";
    OpportunityStatus[OpportunityStatus["Lost"] = 30] = "Lost";
    OpportunityStatus[OpportunityStatus["BadLead"] = 50] = "BadLead";
})(OpportunityStatus || (OpportunityStatus = {}));
export var JobType;
(function (JobType) {
    JobType[JobType["Moving"] = 1] = "Moving";
    JobType[JobType["Packing"] = 3] = "Packing";
    JobType[JobType["MovingAndPacking"] = 4] = "MovingAndPacking";
    JobType[JobType["LoadOnly"] = 5] = "LoadOnly";
    JobType[JobType["UnloadOnly"] = 6] = "UnloadOnly";
    JobType[JobType["Commercial"] = 7] = "Commercial";
    JobType[JobType["StorageInBound"] = 8] = "StorageInBound";
    JobType[JobType["StorageOutBound"] = 9] = "StorageOutBound";
    JobType[JobType["InnerHouse"] = 10] = "InnerHouse";
    JobType[JobType["JunkRemoval"] = 11] = "JunkRemoval";
    JobType[JobType["LaborOnly"] = 12] = "LaborOnly";
})(JobType || (JobType = {}));
export var PhoneType;
(function (PhoneType) {
    PhoneType[PhoneType["Mobile"] = 0] = "Mobile";
    PhoneType[PhoneType["Home"] = 1] = "Home";
    PhoneType[PhoneType["Office"] = 2] = "Office";
    PhoneType[PhoneType["Other"] = 3] = "Other";
})(PhoneType || (PhoneType = {}));
export var FollowUpType;
(function (FollowUpType) {
    FollowUpType[FollowUpType["Email"] = 0] = "Email";
    FollowUpType[FollowUpType["Call"] = 1] = "Call";
    FollowUpType[FollowUpType["Text"] = 2] = "Text";
    FollowUpType[FollowUpType["Other"] = 3] = "Other";
    FollowUpType[FollowUpType["CMET"] = 4] = "CMET";
})(FollowUpType || (FollowUpType = {}));
export var CallType;
(function (CallType) {
    CallType[CallType["Outbound"] = 0] = "Outbound";
    CallType[CallType["Inbound"] = 1] = "Inbound";
})(CallType || (CallType = {}));
export var CallOutcome;
(function (CallOutcome) {
    CallOutcome[CallOutcome["NoAnswer"] = 0] = "NoAnswer";
    CallOutcome[CallOutcome["Busy"] = 1] = "Busy";
    CallOutcome[CallOutcome["WrongNumber"] = 2] = "WrongNumber";
    CallOutcome[CallOutcome["LeftLiveMessage"] = 3] = "LeftLiveMessage";
    CallOutcome[CallOutcome["LeftVoicemail"] = 4] = "LeftVoicemail";
    CallOutcome[CallOutcome["Connected"] = 5] = "Connected";
    CallOutcome[CallOutcome["NumberDisconnected"] = 6] = "NumberDisconnected";
})(CallOutcome || (CallOutcome = {}));
export var PropertyType;
(function (PropertyType) {
    PropertyType[PropertyType["Apartment"] = 1] = "Apartment";
    PropertyType[PropertyType["House"] = 2] = "House";
    PropertyType[PropertyType["Commercial"] = 3] = "Commercial";
    PropertyType[PropertyType["Storage"] = 4] = "Storage";
    PropertyType[PropertyType["Warehouse"] = 5] = "Warehouse";
    PropertyType[PropertyType["AssistedLiving"] = 6] = "AssistedLiving";
    PropertyType[PropertyType["HighRise"] = 7] = "HighRise";
    PropertyType[PropertyType["TownHouse"] = 8] = "TownHouse";
    PropertyType[PropertyType["Other"] = 10] = "Other";
})(PropertyType || (PropertyType = {}));
export var FileCategory;
(function (FileCategory) {
    FileCategory[FileCategory["Documents"] = 0] = "Documents";
    FileCategory[FileCategory["Customer"] = 1] = "Customer";
    FileCategory[FileCategory["Survey"] = 2] = "Survey";
    FileCategory[FileCategory["PreMove"] = 3] = "PreMove";
    FileCategory[FileCategory["PostMove"] = 4] = "PostMove";
    FileCategory[FileCategory["Claims"] = 5] = "Claims";
    FileCategory[FileCategory["DescriptiveInventory"] = 6] = "DescriptiveInventory";
})(FileCategory || (FileCategory = {}));
export var OpportunityType;
(function (OpportunityType) {
    OpportunityType[OpportunityType["Local"] = 0] = "Local";
    OpportunityType[OpportunityType["Intrastate"] = 1] = "Intrastate";
    OpportunityType[OpportunityType["Interstate"] = 2] = "Interstate";
})(OpportunityType || (OpportunityType = {}));
export var PaymentType;
(function (PaymentType) {
    PaymentType[PaymentType["Cash"] = 0] = "Cash";
    PaymentType[PaymentType["Check"] = 1] = "Check";
    PaymentType[PaymentType["CreditCard"] = 2] = "CreditCard";
    PaymentType[PaymentType["CCGateway"] = 3] = "CCGateway";
    PaymentType[PaymentType["BillToAccount"] = 6] = "BillToAccount";
    PaymentType[PaymentType["StorageCredit"] = 7] = "StorageCredit";
    PaymentType[PaymentType["ECheck"] = 8] = "ECheck";
})(PaymentType || (PaymentType = {}));
export var StopType;
(function (StopType) {
    StopType[StopType["PickUp"] = 0] = "PickUp";
    StopType[StopType["DropOff"] = 1] = "DropOff";
})(StopType || (StopType = {}));
export var LeadStatus;
(function (LeadStatus) {
    LeadStatus[LeadStatus["New"] = 0] = "New";
    LeadStatus[LeadStatus["Contacted"] = 1] = "Contacted";
    LeadStatus[LeadStatus["Qualified"] = 2] = "Qualified";
    LeadStatus[LeadStatus["Lost"] = 3] = "Lost";
    LeadStatus[LeadStatus["BadLead"] = 4] = "BadLead";
    LeadStatus[LeadStatus["Converted"] = 5] = "Converted";
})(LeadStatus || (LeadStatus = {}));
//# sourceMappingURL=types.js.map