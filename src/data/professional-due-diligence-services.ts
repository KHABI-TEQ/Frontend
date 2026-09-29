export type DueDiligenceRole = "Lawyer" | "Surveyor" | "Valuer";

export type DueDiligenceService = {
  id: string;
  name: string;
  suggestedFee: number;
};

// Suggested editable starting fees in NGN. They are not a professional tariff.
export const DUE_DILIGENCE_SERVICES: Record<DueDiligenceRole, DueDiligenceService[]> = {
  Lawyer: [
    { id: "title-document-review", name: "Review title and ownership documents", suggestedFee: 100_000 },
    { id: "title-search", name: "Conduct land registry and title search", suggestedFee: 100_000 },
    { id: "chain-of-title", name: "Review chain of title and prior transfers", suggestedFee: 75_000 },
    { id: "encumbrance-litigation", name: "Check for encumbrances, claims and recorded disputes", suggestedFee: 75_000 },
    { id: "planning-approvals", name: "Review planning consent and property approvals", suggestedFee: 75_000 },
    { id: "contract-review", name: "Review sale, lease or assignment documents", suggestedFee: 100_000 },
    { id: "seller-authority", name: "Verify seller or developer authority to transact", suggestedFee: 75_000 },
    { id: "written-legal-opinion", name: "Prepare a written legal due diligence report", suggestedFee: 100_000 },
  ],
  Surveyor: [
    { id: "survey-plan-check", name: "Verify survey plan and land registry charting", suggestedFee: 100_000 },
    { id: "boundary-verification", name: "Verify site boundaries and beacon positions", suggestedFee: 125_000 },
    { id: "coordinates-site", name: "Confirm site location and coordinates on the ground", suggestedFee: 100_000 },
    { id: "encroachment-check", name: "Assess visible boundary overlap or encroachment", suggestedFee: 100_000 },
    { id: "topographic-survey", name: "Carry out a topographic or site survey", suggestedFee: 175_000 },
    { id: "subdivision-layout", name: "Review subdivision, plot layout or site dimensions", suggestedFee: 125_000 },
    { id: "survey-report", name: "Prepare a written survey findings report", suggestedFee: 75_000 },
  ],
  Valuer: [
    { id: "market-valuation", name: "Assess current market value", suggestedFee: 125_000 },
    { id: "rental-valuation", name: "Assess market rental value", suggestedFee: 100_000 },
    { id: "land-building-valuation", name: "Value land and completed improvements", suggestedFee: 150_000 },
    { id: "investment-appraisal", name: "Prepare property investment or development appraisal", suggestedFee: 150_000 },
    { id: "comparable-analysis", name: "Review comparable sales and rental evidence", suggestedFee: 75_000 },
    { id: "condition-inspection", name: "Inspect and report on observable property condition", suggestedFee: 100_000 },
    { id: "valuation-report", name: "Prepare a formal valuation report", suggestedFee: 125_000 },
  ],
};
