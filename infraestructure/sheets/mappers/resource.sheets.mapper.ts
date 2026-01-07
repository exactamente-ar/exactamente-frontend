import { Resource } from "../../../domain/resource/resource.entity";
import {
  ResourceType,
  ResourceFormat,
} from "../../../domain/resource/resource.types";

export interface SheetResourceRow {
  id: string;
  title: string;
  date: string | Date;
  type: string;
  fileFormat: string;
  urlDrive: string;
  subjectId: string;
}

export function toDomainResource(row: SheetResourceRow): Resource {
  return Resource.create({
    id: row.id,
    title: row.title,
    date: new Date(row.date),
    type: row.type as ResourceType,
    fileFormat: row.fileFormat as ResourceFormat,
    urlDrive: row.urlDrive,
    subjectId: row.subjectId,
  });
}
