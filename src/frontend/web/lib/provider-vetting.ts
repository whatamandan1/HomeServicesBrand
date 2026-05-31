export const ID_DOCUMENT_TYPES = [
  { value: "Passport", label: "Passport" },
  { value: "DrivingLicence", label: "Driving licence" },
  { value: "BiometricResidencePermit", label: "Biometric residence permit" },
  { value: "NationalIdentityCard", label: "National identity card" },
  { value: "Other", label: "Other photo ID" },
] as const;

export type ProviderVettingStatus = {
  isSubmitted: boolean;
  isComplete: boolean;
  idVerified: boolean;
  rightToWorkVerified: boolean;
  dbsVerified: boolean;
  submittedAtUtc: string | null;
};

export type ProviderVettingDetails = {
  status: ProviderVettingStatus;
  dateOfBirth: string | null;
  idDocumentType: string | null;
  idDocumentNumber: string | null;
  rightToWorkShareCode: string | null;
  rightToWorkDocumentDescription: string | null;
  dbsCertificateNumber: string | null;
  dbsIssueDate: string | null;
  dbsOnUpdateService: boolean;
  hasLeafBlower: boolean;
  hasHedgeTrimmer: boolean;
  hasPressureWasherForPatio: boolean;
};

export type SubmitProviderVettingPayload = {
  dateOfBirth: string;
  idDocumentType: string;
  idDocumentNumber: string;
  rightToWorkShareCode: string | null;
  rightToWorkDocumentDescription: string | null;
  dbsCertificateNumber: string;
  dbsIssueDate: string;
  dbsOnUpdateService: boolean;
  hasLeafBlower: boolean;
  hasHedgeTrimmer: boolean;
  hasPressureWasherForPatio: boolean;
};

export type AdminProviderVetting = ProviderVettingDetails & {
  providerId: string;
};
