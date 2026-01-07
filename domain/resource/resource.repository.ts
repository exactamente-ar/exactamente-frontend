import { Resource } from "./resource.entity";
import { FindByTypeParams } from "./resource.types";

export interface ResourceRepository {
  /*
  get(resourceId: string): Promise<Resource>;
  download(resource: Resource): Promise<void>;
  viewDrive(resource: Resource): Promise<void>;
  upload(resource: Resource): Promise<void>;
  findById(id: string): Promise<Resource | null>;
*/
  findByType(params: FindByTypeParams): Promise<Resource[]>;
}
