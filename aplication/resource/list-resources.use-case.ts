import { Resource } from "../../domain/resource/resource.entity";
import { ResourceRepository } from "../../domain/resource/resource.repository";
import { FindByTypeParams } from "../../domain/resource/resource.types";

export class ListResourcesUseCase {
  constructor(private readonly resourceRepo: ResourceRepository) {}

  async execute({
    type,
    subjectId,
  }: FindByTypeParams): Promise<Resource[]> {
    return this.resourceRepo.findByType({
      subjectId,
      type,
    });
  }
}
