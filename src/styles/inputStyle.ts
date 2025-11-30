/** @format */

const customStyles = {
  control: (base: any, state: any) => ({
    ...base,
    height: '50px',
    background: 'white',
    overflow: 'hidden',
    display: 'flex',
    width: '100%',
    borderColor: state.isFocused ? 'teal' : base.borderColor,
    boxShadow: state.isFocused ? '0 0 0 1px teal' : base.boxShadow,
    '&:hover': {
      borderColor: state.isFocused ? '#14b8a6' : base.borderColor,
    },
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isFocused
      ? '#8DDB90'
      : state.isSelected
      ? '#09391C'
      : undefined,
    color: state.isSelected ? 'white' : base.color,
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#09391C',
    },
  }),
  dropdownIndicator: (base: any, state: any) => ({
    ...base,
    color: state.isFocused ? '#14b8a6' : base.color,
    '&:hover': {
      color: '#09391C',
    },
  }),
  indicatorSeparator: () => ({
    display: 'none', // optional: remove the separator between input and dropdown arrow
  }),
};

export default customStyles;
