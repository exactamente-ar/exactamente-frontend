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
  title: string;
  previewUrl: string;
  downloadUrl: string;
};

export type StringResource = 'Parciales' | 'Resumenes' | 'Finales';
