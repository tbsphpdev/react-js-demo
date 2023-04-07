import { Stack, Box } from '@material-ui/core';
import LazySize from 'components/LazySize';
import { RootState, useSelector } from 'redux/store';

const Banner = () => {
  const { banner } = useSelector((state: RootState) => state.customiser);
  return (
    <Stack spacing={{ xs: 3, sm: 2 }} justifyContent="center">
      {banner && (
        <Box display="flex" justifyContent="center" flexGrow={2}>
          <LazySize
            alt="banner_logo"
            src={banner}
            sx={{
              borderRadius: 1,
              maxHeight: '275px',
              maxWidth: '750px',
              width: '100%',
              height: '100%'
            }}
          />
        </Box>
      )}
    </Stack>
  );
};

export default Banner;
