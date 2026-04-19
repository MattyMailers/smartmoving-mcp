// ============================================================================
// SmartMoving External API v1 - TypeScript Type Definitions
// ============================================================================

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export enum OpportunityStatus {
  NewLead = 0,
  LeadInProgress = 1,
  Opportunity = 3,
  Booked = 4,
  Completed = 10,
  Closed = 11,
  Cancelled = 20,
  Lost = 30,
  BadLead = 50,
}

export enum JobType {
  Moving = 1,
  Packing = 3,
  MovingAndPacking = 4,
  LoadOnly = 5,
  UnloadOnly = 6,
  Commercial = 7,
  StorageInBound = 8,
  StorageOutBound = 9,
  InnerHouse = 10,
  JunkRemoval = 11,
  LaborOnly = 12,
}

export enum PhoneType {
  Mobile = 0,
  Home = 1,
  Office = 2,
  Other = 3,
}

export enum FollowUpType {
  Email = 0,
  Call = 1,
  Text = 2,
  Other = 3,
  CMET = 4,
}

export enum CallType {
  Outbound = 0,
  Inbound = 1,
}

export enum CallOutcome {
  NoAnswer = 0,
  Busy = 1,
  WrongNumber = 2,
  LeftLiveMessage = 3,
  LeftVoicemail = 4,
  Connected = 5,
  NumberDisconnected = 6,
}

export enum PropertyType {
  Apartment = 1,
  House = 2,
  Commercial = 3,
  Storage = 4,
  Warehouse = 5,
  AssistedLiving = 6,
  HighRise = 7,
  TownHouse = 8,
  Other = 10,
}

export enum FileCategory {
  Documents = 0,
  Customer = 1,
  Survey = 2,
  PreMove = 3,
  PostMove = 4,
  Claims = 5,
  DescriptiveInventory = 6,
}

export enum OpportunityType {
  Local = 0,
  Intrastate = 1,
  Interstate = 2,
}

export enum PaymentType {
  Cash = 0,
  Check = 1,
  CreditCard = 2,
  CCGateway = 3,
  BillToAccount = 6,
  StorageCredit = 7,
  ECheck = 8,
}

export enum StopType {
  PickUp = 0,
  DropOff = 1,
}

export enum LeadStatus {
  New = 0,
  Contacted = 1,
  Qualified = 2,
  Lost = 3,
  BadLead = 4,
  Converted = 5,
}

// ---------------------------------------------------------------------------
// Common / Shared Types
// ---------------------------------------------------------------------------

export interface PageViewModel<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GeocodedAddress {
  street?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  propertyType?: PropertyType | null;
  floor?: number | null;
  hasElevator?: boolean | null;
  flightsOfStairs?: number | null;
  walkDistance?: number | null;
  apartmentNumber?: string | null;
}

export interface PhoneViewModel {
  phoneNumber?: string | null;
  phoneType?: PhoneType;
  isPrimary?: boolean;
}

export interface EmailViewModel {
  email?: string | null;
  isPrimary?: boolean;
}

// ---------------------------------------------------------------------------
// Customer Models
// ---------------------------------------------------------------------------

export interface CustomerModel {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  phones?: PhoneViewModel[] | null;
  emails?: EmailViewModel[] | null;
  address?: GeocodedAddress | null;
  notes?: string | null;
  createdDate?: string | null;
  modifiedDate?: string | null;
}

export interface CustomerViewModel extends CustomerModel {
  opportunityCount?: number;
  totalRevenue?: number;
  lastServiceDate?: string | null;
}

export interface CreateCustomerForm {
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  phones?: PhoneViewModel[] | null;
  emails?: EmailViewModel[] | null;
  address?: GeocodedAddress | null;
  notes?: string | null;
}

export interface UpdateCustomerForm extends CreateCustomerForm {
  id: string;
}

// ---------------------------------------------------------------------------
// Lead Models
// ---------------------------------------------------------------------------

export interface LeadViewModel {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  fullName?: string | null;
  phones?: PhoneViewModel[] | null;
  emails?: EmailViewModel[] | null;
  moveDate?: string | null;
  originAddress?: GeocodedAddress | null;
  destinationAddress?: GeocodedAddress | null;
  referralSource?: string | null;
  referralSourceId?: string | null;
  status?: LeadStatus;
  notes?: string | null;
  salesPersonId?: string | null;
  salesPersonName?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  createdDate?: string | null;
  modifiedDate?: string | null;
  serviceTypeId?: string | null;
  moveSizeId?: string | null;
  estimatedWeight?: number | null;
  estimatedVolume?: number | null;
}

export interface NewLeadModel {
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  name?: string | null;
  phones?: PhoneViewModel[] | null;
  emails?: EmailViewModel[] | null;
  moveDate?: string | null;
  originAddress?: GeocodedAddress | null;
  destinationAddress?: GeocodedAddress | null;
  referralSourceId: string;
  notes?: string | null;
  branchId?: string | null;
  serviceTypeId?: string | null;
  moveSizeId?: string | null;
  estimatedWeight?: number | null;
  estimatedVolume?: number | null;
}

export interface LeadForm {
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  name?: string | null;
  phones?: PhoneViewModel[] | null;
  emails?: EmailViewModel[] | null;
  moveDate?: string | null;
  originAddress?: GeocodedAddress | null;
  destinationAddress?: GeocodedAddress | null;
  referralSourceId?: string | null;
  notes?: string | null;
  branchId?: string | null;
  serviceTypeId?: string | null;
  moveSizeId?: string | null;
  estimatedWeight?: number | null;
  estimatedVolume?: number | null;
}

export interface PatchLeadForm {
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  phones?: PhoneViewModel[] | null;
  emails?: EmailViewModel[] | null;
  moveDate?: string | null;
  originAddress?: GeocodedAddress | null;
  destinationAddress?: GeocodedAddress | null;
  referralSourceId?: string | null;
  notes?: string | null;
  branchId?: string | null;
  serviceTypeId?: string | null;
  moveSizeId?: string | null;
}

export interface LeadStatusViewModel {
  id: number;
  name: string;
}

export interface ConvertLeadForm {
  salesPersonId?: string | null;
}

// ---------------------------------------------------------------------------
// Opportunity Models
// ---------------------------------------------------------------------------

export interface OpportunityDetailsViewModel {
  id: string;
  quoteNumber?: string | null;
  status?: OpportunityStatus;
  opportunityType?: OpportunityType;
  customerId?: string | null;
  customerName?: string | null;
  companyName?: string | null;
  phones?: PhoneViewModel[] | null;
  emails?: EmailViewModel[] | null;
  moveDate?: string | null;
  originAddress?: GeocodedAddress | null;
  destinationAddress?: GeocodedAddress | null;
  referralSourceId?: string | null;
  referralSourceName?: string | null;
  salesPersonId?: string | null;
  salesPersonName?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  serviceTypeId?: string | null;
  moveSizeId?: string | null;
  tariffId?: string | null;
  estimatedWeight?: number | null;
  estimatedVolume?: number | null;
  totalPrice?: number | null;
  totalCost?: number | null;
  notes?: string | null;
  internalNotes?: string | null;
  jobs?: JobViewModel[] | null;
  followUps?: FollowUpViewModel[] | null;
  payments?: PaymentViewModel[] | null;
  documents?: DocumentViewModel[] | null;
  rooms?: RoomViewModel[] | null;
  createdDate?: string | null;
  modifiedDate?: string | null;
  bookedDate?: string | null;
  completedDate?: string | null;
  cancelledDate?: string | null;
  lostDate?: string | null;
  lostReasonId?: string | null;
  cancellationReasonId?: string | null;
  arrivalWindowId?: string | null;
  arrivalWindowName?: string | null;
}

export interface CreatePrimeOpportunityForm {
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  name?: string | null;
  phones?: PhoneViewModel[] | null;
  emails?: EmailViewModel[] | null;
  moveDate?: string | null;
  originAddress?: GeocodedAddress | null;
  destinationAddress?: GeocodedAddress | null;
  referralSourceId: string;
  notes?: string | null;
  branchId?: string | null;
  serviceTypeId?: string | null;
  moveSizeId?: string | null;
  tariffId?: string | null;
  salesPersonId?: string | null;
  estimatedWeight?: number | null;
  estimatedVolume?: number | null;
  arrivalWindowId?: string | null;
}

export interface UpdateOpportunityForm {
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  phones?: PhoneViewModel[] | null;
  emails?: EmailViewModel[] | null;
  moveDate?: string | null;
  originAddress?: GeocodedAddress | null;
  destinationAddress?: GeocodedAddress | null;
  referralSourceId?: string | null;
  notes?: string | null;
  internalNotes?: string | null;
  branchId?: string | null;
  serviceTypeId?: string | null;
  moveSizeId?: string | null;
  tariffId?: string | null;
  salesPersonId?: string | null;
  estimatedWeight?: number | null;
  estimatedVolume?: number | null;
  status?: OpportunityStatus | null;
  arrivalWindowId?: string | null;
  lostReasonId?: string | null;
  cancellationReasonId?: string | null;
}

export interface OpportunityAuditViewModel {
  id: string;
  action?: string | null;
  details?: string | null;
  performedBy?: string | null;
  performedDate?: string | null;
}

// ---------------------------------------------------------------------------
// Job Models
// ---------------------------------------------------------------------------

export interface JobViewModel {
  id: string;
  opportunityId?: string | null;
  jobType?: JobType;
  jobDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  status?: string | null;
  crewSize?: number | null;
  truckCount?: number | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
  estimatedWeight?: number | null;
  actualWeight?: number | null;
  notes?: string | null;
  stops?: JobStopViewModel[] | null;
  materials?: JobMaterialViewModel[] | null;
  crewMembers?: CrewMemberViewModel[] | null;
  createdDate?: string | null;
  modifiedDate?: string | null;
  confirmedDate?: string | null;
}

export interface QuoteAddJobForm {
  jobType: JobType;
  jobDate?: string | null;
  startTime?: string | null;
  crewSize?: number | null;
  truckCount?: number | null;
  estimatedHours?: number | null;
  notes?: string | null;
  stops?: JobStopForm[] | null;
}

export interface JobStopViewModel {
  id?: string | null;
  stopType?: StopType;
  address?: GeocodedAddress | null;
  sortOrder?: number;
}

export interface JobStopForm {
  stopType: StopType;
  address: GeocodedAddress;
  sortOrder?: number;
}

export interface JobMaterialViewModel {
  id?: string | null;
  materialId?: string | null;
  materialName?: string | null;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
}

export interface CrewMemberViewModel {
  id?: string | null;
  userId?: string | null;
  userName?: string | null;
  role?: string | null;
}

export interface UpdateJobNotesForm {
  notes: string;
}

export interface UpdateJobStopsForm {
  stops: JobStopForm[];
}

export interface AddJobMaterialsForm {
  materials: {
    materialId: string;
    quantity: number;
  }[];
}

// ---------------------------------------------------------------------------
// Inventory Models
// ---------------------------------------------------------------------------

export interface InventoryViewModel {
  rooms?: InventoryRoomViewModel[] | null;
  totalItems?: number;
  totalWeight?: number;
  totalVolume?: number;
}

export interface InventoryRoomViewModel {
  id: string;
  roomTypeId?: string | null;
  roomTypeName?: string | null;
  name?: string | null;
  sortOrder?: number;
  items?: InventoryItemViewModel[] | null;
}

export interface InventoryItemViewModel {
  id: string;
  masterInventoryItemId?: string | null;
  name?: string | null;
  quantity?: number;
  weight?: number;
  volume?: number;
  notes?: string | null;
}

export interface AddInventoryItemsForm {
  items: {
    masterInventoryItemId: string;
    quantity: number;
    notes?: string | null;
  }[];
}

export interface UpdateInventoryItemForm {
  quantity?: number;
  notes?: string | null;
}

export interface MasterInventoryItemViewModel {
  id: string;
  name?: string | null;
  weight?: number;
  volume?: number;
  categoryId?: string | null;
  categoryName?: string | null;
}

export interface RoomTypeViewModel {
  id: string;
  name?: string | null;
  sortOrder?: number;
}

export interface RoomViewModel {
  id: string;
  roomTypeId?: string | null;
  name?: string | null;
  sortOrder?: number;
}

export interface CreateRoomForm {
  roomTypeId: string;
  name?: string | null;
}

// ---------------------------------------------------------------------------
// Follow-Up Models
// ---------------------------------------------------------------------------

export interface FollowUpModel {
  followUpType: FollowUpType;
  dueDate: string;
  notes?: string | null;
  assignedToId?: string | null;
}

export interface FollowUpViewModel {
  id: string;
  opportunityId?: string | null;
  followUpType?: FollowUpType;
  dueDate?: string | null;
  completedDate?: string | null;
  isComplete?: boolean;
  notes?: string | null;
  assignedToId?: string | null;
  assignedToName?: string | null;
  createdDate?: string | null;
  modifiedDate?: string | null;
}

export interface UpdateFollowUpForm {
  followUpType?: FollowUpType;
  dueDate?: string | null;
  notes?: string | null;
  assignedToId?: string | null;
}

// ---------------------------------------------------------------------------
// Communication Models
// ---------------------------------------------------------------------------

export interface LogCallForm {
  callType: CallType;
  callOutcome: CallOutcome;
  notes?: string | null;
  durationSeconds?: number | null;
  calledNumber?: string | null;
}

export interface LogNoteForm {
  notes: string;
}

// ---------------------------------------------------------------------------
// Payment Models
// ---------------------------------------------------------------------------

export interface PaymentViewModel {
  id: string;
  opportunityId?: string | null;
  paymentType?: PaymentType;
  amount?: number;
  paymentDate?: string | null;
  notes?: string | null;
  referenceNumber?: string | null;
}

// ---------------------------------------------------------------------------
// Document / Attachment Models
// ---------------------------------------------------------------------------

export interface DocumentViewModel {
  id: string;
  fileName?: string | null;
  fileCategory?: FileCategory;
  fileUrl?: string | null;
  uploadedDate?: string | null;
  uploadedBy?: string | null;
}

export interface AddAttachmentForm {
  fileName: string;
  fileCategory: FileCategory;
  fileBase64: string;
  notes?: string | null;
}

// ---------------------------------------------------------------------------
// Reference Data Models
// ---------------------------------------------------------------------------

export interface BranchViewModel {
  id: string;
  name?: string | null;
  isActive?: boolean;
}

export interface MoveSizeViewModel {
  id: string;
  name?: string | null;
  sortOrder?: number;
}

export interface ReferralSourceViewModel {
  id: string;
  name?: string | null;
  isActive?: boolean;
  category?: string | null;
}

export interface ServiceTypeViewModel {
  id: string;
  name?: string | null;
  isActive?: boolean;
}

export interface TariffViewModel {
  id: string;
  name?: string | null;
  branchId?: string | null;
  isActive?: boolean;
}

export interface TariffMaterialViewModel {
  id: string;
  tariffId?: string | null;
  name?: string | null;
  unitPrice?: number;
  isActive?: boolean;
}

export interface UserViewModel {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  email?: string | null;
  isActive?: boolean;
  role?: string | null;
}

export interface ArrivalWindowViewModel {
  id: string;
  name?: string | null;
  startTime?: string | null;
  endTime?: string | null;
}

export interface BadLeadReasonViewModel {
  id: string;
  name?: string | null;
}

export interface CancellationReasonViewModel {
  id: string;
  name?: string | null;
}

export interface LostReasonViewModel {
  id: string;
  name?: string | null;
}

export interface StorageAccountViewModel {
  id: string;
  customerId?: string | null;
  accountNumber?: string | null;
  status?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  monthlyRate?: number | null;
  balance?: number | null;
}

export interface ServiceTicketViewModel {
  id: string;
  customerId?: string | null;
  opportunityId?: string | null;
  status?: string | null;
  type?: string | null;
  description?: string | null;
  createdDate?: string | null;
  resolvedDate?: string | null;
}

// ---------------------------------------------------------------------------
// API Error
// ---------------------------------------------------------------------------

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]> | null;
}
