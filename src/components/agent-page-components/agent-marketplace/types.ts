/** @format */

export type PropertySelectedProps =
  | {
      propertyTye: string;
      propertyPrice: number;
      propertyFeatures: string[];
      dateCreated: string;
      location: {
        state: string;
        lga: string;
      };
      documents: string[];
    }
  | undefined;
