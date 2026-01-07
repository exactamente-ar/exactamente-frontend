import { ResourceRepository } from "../../domain/resource/resource.repository";
import { Resource } from "../../domain/resource/resource.entity";
import { SheetClient } from "./sheet-client";
import { toDomainResource } from "./mappers/resource.sheets.mapper";
import { FindByTypeParams } from "../../domain/resource/resource.types";

export class SheetsResourceRepository implements ResourceRepository {
  constructor(private readonly sheetClient: SheetClient) {}

  async findByType(params: FindByTypeParams): Promise<Resource[]> {
    const rows = await this.sheetClient.get(params.type, params.subjectId);
    return rows.data.map(toDomainResource);
  }
}
