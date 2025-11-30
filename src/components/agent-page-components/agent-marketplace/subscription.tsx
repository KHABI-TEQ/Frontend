/** @format */

const Subscription = ({
  handleNextPage,
}: {
  handleNextPage: (
    type: 'agent marketplace' | 'subscription' | 'preference' | 'make payment'
  ) => void;
}) => {
  return (
    <form
      onSubmit={(event: React.FormEvent) => event.preventDefault()}
      className='flex items-center justify-center'>
      <div className='container flex items-center justify-center flex-col gap-[40px]'>
        <h2 className='text-center font-display font-semibold text-[#09391C] text-3xl md:text-4xl'>
          Subscription Payment
        </h2>
        <div className='md:w-[602px] w-full flex flex-col gap-[20px]'>
          <h3 className='text-xl font-semibold text-[#09391C]'>
            Subscription Period
          </h3>
          <label htmlFor='period' className='flex flex-col gap-[10px]'>
            <span className='text-base font-medium text-[#1E1E1E]'>
              Select period
            </span>
            <select
              id='period'
              title='Select period'
              className='py-[16px] px-[12px] cursor-pointer bg-[#FFFFFF] border-[1px] border-[#D6DDEB]'>
              <option value='2 months'>2 months</option>
            </select>
          </label>
          <h2 className='text-black font-display text-3xl font-semibold text-center'>
            N&nbsp;{Number(10000).toLocaleString()}
          </h2>
          <button
            onClick={() => handleNextPage('make payment')}
            type='button'
            className='h-[65px] bg-[#8DDB90] text-base font-bold text-[#FAFAFA]'>
            Proceed
          </button>
        </div>
      </div>
    </form>
  );
};

export default Subscription;
