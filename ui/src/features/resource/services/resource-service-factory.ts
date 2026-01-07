import { ListResourcesUseCase } from "../../../../../aplication/resource/list-resources.use-case";
import { SheetsResourceRepository } from "../../../../../infraestructure/sheets/resource.repository.sheets";
import { SheetClient } from "../../../../../infraestructure/sheets/sheet-client";
import { toDTO } from "../../../../../aplication/resource/resource.dto";
import type { FindByTypeParams } from "../../../../../domain/resource/resource.types";

const API_URL = "https://api.sheetbest.com/sheets/13b4f0d7-e711-4897-afc0-e8bb6fff8759";

const sheetClient = new SheetClient(API_URL);
const resourceRepository = new SheetsResourceRepository(sheetClient);
export const listResourcesUseCase = new ListResourcesUseCase(resourceRepository);


export const resourceService = {
  async listResources(params: FindByTypeParams) {
    const resources = await listResourcesUseCase.execute(params);
    return resources.map(toDTO);
  }
};
