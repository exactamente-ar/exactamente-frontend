import type { ResourceDTO } from "../../aplication/resource/resource.dto";
import { ResourceFormat, ResourceType } from "./resource.types";

export class Resource {
  private constructor(
    public readonly id: string,
    public readonly subjectId: string,
    private readonly date: Date,
    private readonly type: ResourceType,
    private readonly fileFormat: ResourceFormat,
    private readonly urlDrive: string,
    private title: string,
  ) {}

  static create(props: ResourceDTO): Resource {
    if (!props.title.trim()) {
      throw new Error("Resource title is required");
    }

    if (!props.urlDrive.startsWith("http")) {
      throw new Error("Invalid drive URL");
    }

    return new Resource(
      props.id || crypto.randomUUID(),
      props.subjectId,
      props.date,
      props.type,
      props.fileFormat,
      props.urlDrive,
      props.title,
    );
  }

  getTitle() {
    return this.title;
  }

  getDate() {
    return this.date;
  }

  getType() {
    return this.type;
  }

  getFormat() {
    return this.fileFormat;
  }

  getUrl() {
    return this.urlDrive;
  }

  getSubjectId() {
    return this.subjectId;
  }
}
