import { mockRequest } from "@/services/apiClient";
import { importSummary, validationErrors } from "@/data/bulkUpload";

export function getLastImport() {
  return mockRequest({ importSummary, validationErrors });
}
