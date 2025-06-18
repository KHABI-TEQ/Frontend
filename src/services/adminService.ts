import api from '../utils/axiosConfig';

export const getProperties = async (page: number, limit: number) => {
  try {
    const response = await api.get(`/admin/properties?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getRequests = async (page: number, limit: number, propertyType: string) => {
  try {
    const response = await api.get(`/admin/request/all?page=${page}&limit=${limit}&propertyType=${propertyType}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
