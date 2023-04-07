import { Stack, Box } from '@material-ui/core';
import LazySize from 'components/LazySize';
import { RootState, useSelector } from 'redux/store';

const CustomerLogo = () => {
  const { customerLogo } = useSelector((state: RootState) => state.customiser);
  return (
    <Stack spacing={{ xs: 3, sm: 2 }} justifyContent="center">
      {customerLogo && (
        <Box display="flex" justifyContent="center">
          <LazySize
            alt="main_logo"
            src={customerLogo}
            sx={{
              maxHeight: '250px',
              maxWidth: '250px'
            }}
          />
        </Box>
      )}
    </Stack>
  );
};

export default CustomerLogo;
