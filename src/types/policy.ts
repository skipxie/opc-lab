export type Policy = {
  id: string;
  title: string;
  regionName: string;
  lat: number | null;
  lng: number | null;
  policyType: string;
  targetAudience: string;
  summary: string;
  requirements: string;
  materials: string;
  officialUrl: string;
  deadline: string | null;
  publishedOn: string | null;
  sourceName: string;
  updatedAt: string;
  isFeatured: boolean;
  tags: string[];
};

