import { Resource } from "../../domain/resource/resource.entity";
import {
  ResourceFormat,
  ResourceType,
} from "../../domain/resource/resource.types";

export interface ResourceDTO {
  id?: string;
  title: string;
  date: Date;
  type: ResourceType;
  fileFormat: ResourceFormat;
  urlDrive: string;
  subjectId: string;
}

export function toDTO(resource: Resource): ResourceDTO {
  return {
    id: resource.id,
    subjectId: resource.getSubjectId(),
    title: resource.getTitle(),
    date: resource.getDate(),
    type: resource.getType(),
    fileFormat: resource.getFormat(),
    urlDrive: resource.getUrl(),
  };
}
