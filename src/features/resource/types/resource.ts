export interface TypeResource {
  date: string;
  downloads: number;
  from: string;
  mostRecent: boolean;
  size: string;
  type: string;
  title: string;
}

export type ResourceFetch = {
  id: string;
  idMateria: string;
  title: string;
  urlDrive: string;
};

export type StringResource = 'Parciales' | 'Resumenes' | 'Finales';
