import { BlinkPageManager } from '@customTypes/blinkPages';
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  Link,
  Paper,
  Stack,
  TextField,
  Typography
} from '@material-ui/core';
import { QrCodeOutlined } from '@material-ui/icons';

import CopyClipboard from 'components/CopyClipboard';
import LazySize from 'components/LazySize';
import useToggle from 'hooks/useToggle';
import { useCallback, useEffect } from 'react';
import { openingHoursState, resetSelection, setSelectedBlinkPage } from 'redux/slices/customiser';
import { RootState, useDispatch, useSelector } from 'redux/store';

const TopSection = () => {
  const { blinkPagesList, urlSlug, id, qrCode } = useSelector(
    (state: RootState) => state.customiser
  );
  const dispatch = useDispatch();

  const [showQR, setShowQR] = useToggle(false);

  const handlePageSelection = useCallback(
    (val: BlinkPageManager | null) => {
      if (val) {
        const { openingHours, defaultCurrency, blinkPageCurrency } = val;
        const updatedData = openingHours || openingHoursState;
        const previewCurrency = blinkPageCurrency.filter((b) => b.id === Number(defaultCurrency));
        dispatch(
          setSelectedBlinkPage({
            ...val,
            openingHours: updatedData,
            previewCurrency: previewCurrency[0]?.symbol || ''
          })
        );
      } else {
        dispatch(setSelectedBlinkPage(val));
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (blinkPagesList.length === 1) {
      handlePageSelection(blinkPagesList[0]);
    }
  }, [blinkPagesList, handlePageSelection]);

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 1 }}>
      <Grid item xs={12} sm={4} md={2}>
        {blinkPagesList.length === 1 ? (
          <Paper
            variant="outlined"
            sx={{
              p: 2
            }}
          >
            <Link
              href={`${process.env.REACT_APP_HOST_URL}/public/blink/${blinkPagesList[0].urlSlug}`}
              target="_blank"
              rel="noreferrer"
            >
              <Typography textOverflow="ellipsis">{blinkPagesList[0].urlSlug}</Typography>
            </Link>
          </Paper>
        ) : (
          <Autocomplete
            fullWidth
            id="Blink-page-list"
            options={blinkPagesList}
            getOptionLabel={(option) => option.urlSlug}
            onChange={(e, val) => {
              handlePageSelection(val);
            }}
            onInputChange={(e, val) => {
              if (!val) {
                dispatch(resetSelection());
              }
            }}
            value={id && blinkPagesList.length > 0 ? blinkPagesList.find((b) => b.id === id) : null}
            filterSelectedOptions
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Select Blink Page"
                placeholder="choose a Blink Page..."
              />
            )}
          />
        )}
      </Grid>
      {id && (
        <Grid item xs={12} sm={6} md={6} key={urlSlug}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 1 }}>
            <CopyClipboard
              value={`${process.env.REACT_APP_HOST_URL}/public/blink/${urlSlug}`}
              fullWidth
            />

            {qrCode && (
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<QrCodeOutlined />}
                onClick={() => setShowQR(true)}
                sx={{
                  minWidth: (theme) => theme.spacing(16)
                }}
              >
                <Typography>QR Code</Typography>
              </Button>
            )}
          </Stack>
          {qrCode && (
            <Dialog open={showQR} onClose={() => setShowQR(false)}>
              <DialogContent>
                <Stack spacing={3} justifyContent="center">
                  <Box>
                    <LazySize src={qrCode} alt="QR Code" key={qrCode} />
                  </Box>

                  <Link href={qrCode} target="_blank" rel="noreferrer">
                    <Box display="flex" justifyContent="center">
                      <Button variant="contained">Download QR Code</Button>
                    </Box>
                  </Link>
                </Stack>
              </DialogContent>
            </Dialog>
          )}
        </Grid>
      )}
    </Stack>
  );
};

export default TopSection;
