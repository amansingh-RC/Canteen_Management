export const importSummary = {
  totalUploaded: 512,
  successful: 498,
  failed: 14,
  duplicates: 9,
};

export const validationErrors = [
  { row: 14, employeeId: "EMP2231", reason: "Duplicate Employee ID", severity: "danger" },
  { row: 27, employeeId: "—", reason: "Missing Employee ID", severity: "danger" },
  { row: 41, employeeId: "EMP2289", reason: "Invalid department code", severity: "warning" },
  { row: 63, employeeId: "EMP2301", reason: "Email format invalid", severity: "warning" },
];
