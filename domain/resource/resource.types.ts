export enum ResourceType {
  Parciales = "Parciales",
  Resumenes = "Resumenes",
  Finales = "Finales",
}

export enum ResourceFormat {
  PDF = "PDF",
  PNG = "PNG",
  JPG = "JPG",
}

export interface FindByTypeParams {
  subjectId: string;
  type: ResourceType;
}
