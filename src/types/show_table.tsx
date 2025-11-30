/** @format */

import { DataProps, DataPropsArray } from '@/types/agent_data_props';

export interface ShowTableProps {
  data: DataPropsArray;
  heading: string;
  showFullDetails?: boolean;
  headerData?: string[];
  setShowFullDetails: (type: boolean) => void;
  setDetailsToCheck: ({}: DataProps) => void;
}
