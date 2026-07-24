import { createMockExportJob, mockExportJobs } from "./export.mock";
import type { ExportSpecification } from "@/types/export";

export const exportApi = {
  list: async () => structuredClone(mockExportJobs),
  create: (specification: ExportSpecification) =>
    Promise.resolve(createMockExportJob(specification)),
};
