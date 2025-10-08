export type Classification = {
  summary: {
    species: string;
    type: number;
    defectiveBeansPercentage: number;
    explanation: string;
  };
  details: {
    graveDefects: {
      molded: number;
      burned: number;
      germinated: number;
      chapped_and_attacked_by_caterpillars: number;
    };
    lightDefects: {
      crushed: number;
      damaged: number;
      immature: number;
      broken_or_split: number;
    };
  };
};

export type Colorimetry = {
  averageL: number;
  standardDeviation: number;
  classification: string;
  finalScore: number;
};

export type Analysis = {
  classification: Classification;
  colorimetry: Colorimetry;
};
