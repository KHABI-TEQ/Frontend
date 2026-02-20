import { POST_REQUEST } from '@/utils/requests';
import { URLS } from '@/utils/URLS';
import React, { FC } from 'react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

interface Request {
  _id: string;
  requestFrom: {
    fullName: string;
    email: string;
  };
  propertyId: {
    propertyType: string;
    location: {
      state: string;
      localGovernment: string;
      area: string;
    };
    price: number;
  };
  status: string;
  inspectionDate: string;
  inspectionTime: string;
}

interface TableProps {
  data: Request[];
}

const RequestsTable: FC<TableProps> = ({ data }) => {
  const handleAvailability = async (id: string, isAvailable: boolean) => {
    const url = URLS.BASE + URLS.agent + URLS.confirmAvailability;

    await POST_REQUEST(url, { requestId: id, isAvailable }, Cookies.get('token'))
      .then((result) => {
        if (result.success) {
          toast.success(result.message ?? 'Success');
        } else {
          toast.error(result.error ?? 'Request failed');
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <section className='w-full overflow-x-auto'>
      <div className='w-full min-h-fit py-6 px-4 bg-white flex flex-col gap-6'>
        <div className='min-h-[99px] flex flex-col gap-2'>
          <h2 className='text-xl font-semibold text-gray-900'>Requests</h2>
          <span className='text-sm text-gray-600'>List of property requests</span>
        </div>

        {/* Responsive Table */}
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[700px] border border-gray-200 rounded-lg overflow-hidden'>
            <thead className='bg-gray-100'>
              <tr className='text-left text-gray-700 text-sm'>
                <th className='p-3'>Request From</th>
                <th className='p-3'>Email</th>
                <th className='p-3'>Property Type</th>
                <th className='p-3'>Location</th>
                <th className='p-3'>Price (₦)</th>
                {/* <th className='p-3'>Status</th>
                <th className='p-3'>Inspection</th> */}
                <th className='p-3'>Action</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {data.map((item) => (
                <tr key={item._id} className='text-sm text-gray-900'>
                  <td className='p-3'>{item.requestFrom.fullName}</td>
                  <td className='p-3'>{item.requestFrom.email}</td>
                  <td className='p-3'>{item.propertyId.propertyType}</td>
                  <td className='p-3'>
                    {item.propertyId.location.state}, {item.propertyId.location.localGovernment},{' '}
                    {item.propertyId.location.area}
                  </td>
                  <td className='p-3'>{Number(item.propertyId.price).toLocaleString()}</td>
                  {/* <td className={`p-3 font-semibold ${item.status === 'Accepted' ? 'text-green-600' : 'text-red-600'}`}>
                    {item.status}
                  </td>
                  <td className='p-3'>
                    {new Date(item.inspectionDate).toLocaleDateString()} - {item.inspectionTime}
                  </td> */}
                  <td className='p-3 flex gap-2'>
                    <button
                      className='px-3 py-1 bg-green-500 text-white rounded-md text-xs hover:bg-green-600'
                      onClick={() => handleAvailability(item._id, true)}
                    >
                      Available
                    </button>
                    <button
                      className='px-3 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600'
                      onClick={() => handleAvailability(item._id, false)}
                    >
                      Unavailable
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default RequestsTable;
