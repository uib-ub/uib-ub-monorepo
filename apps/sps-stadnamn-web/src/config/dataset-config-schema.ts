export interface DatasetTitles {
    [key: string]: string;
  }
  
export interface SubindexPresentation {
    [key: string]: {
      img?: string;
      alt?: string;
      imageAttribution?: string;
      description?: string;
      initPage?: string;
    }
  }
  
export interface DatasetPresentation {
    [key: string]: {
      img: string;
      alt: string;
      imageAttribution: string;
      description: string;
      subindices?: SubindexPresentation;
      initPage?: string;
    }
  }
  

  export interface FieldConfigItem {
    key: string;
    label: string;
  }