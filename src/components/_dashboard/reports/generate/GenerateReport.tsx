import * as Yup from 'yup';
import { SingleFilterType } from '@customTypes/report';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  experimentalStyled as styled,
  Stack
} from '@material-ui/core';
import useToggle from 'hooks/useToggle';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';
import { resetReport, setFormError, startLoading, stopLoading } from 'redux/slices/reports';
import { dispatch, RootState, useSelector } from 'redux/store';
import { ErrorMsg } from 'utils/helpError';
import {
  downloadReport,
  getReportFilters,
  previewReport,
  scheduleReport,
  updateReport
} from '_apis_/report';
import { LoadingButton } from '@material-ui/lab';
import LoadingScreen from 'components/LoadingScreen';
import PreviewReport from '../preview/PreviewReport';
import ActiveFilters from './ActiveFilters';
import ChooseFrequency from './ChooseFrequency';
import FilterBoxes from './FilterBoxes';
import ReportsTopSection from './ReportsTopSection';

type PropTypes = {
  setCurrentTab: React.Dispatch<React.SetStateAction<number>>;
};

const FiltersWrapperStyle = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap'
}));

const formSchema = Yup.object().shape({
  recipient: Yup.string().required('Please enter email to receive the reports.'),
  frequency: Yup.lazy((value) =>
    value === ''
      ? Yup.string().required('Please enter the frequency of the reports.')
      : Yup.number().required('Please enter the frequency of the reports.').min(1)
  )
});

const validForm = async (value: { recipient: string; frequency: number }) => {
  const { frequency, recipient } = value;

  const isValid = await formSchema.validate({
    recipient,
    frequency
  });

  return isValid;
};

const GenerateReport = ({ setCurrentTab }: PropTypes) => {
  const [data, setData] = useState<SingleFilterType[]>([]);
  const [isPreview, setIsPreview] = useToggle(false);
  const { enqueueSnackbar } = useSnackbar();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isLoading, createdBy, list, edit, error, id, formErrors, startDate, endDate, ...rest } =
    useSelector((state: RootState) => state.reports);

  const handleSchedule = useCallback(async () => {
    try {
      const isValid = await validForm({
        recipient: rest.recipient,
        frequency: rest.frequency
      });

      if (isValid) {
        await scheduleReport(rest);
        setCurrentTab(1);
        enqueueSnackbar('Report created!', {
          variant: 'success'
        });
      }
    } catch (error) {
      if (error.name === 'ValidationError') {
        dispatch(
          setFormError({
            key: error.path,
            data: error.errors[0]
          })
        );
      } else {
        enqueueSnackbar(ErrorMsg(error), {
          variant: 'error'
        });
      }
    }
  }, [enqueueSnackbar, rest, setCurrentTab]);

  const handleDownload = useCallback(async () => {
    try {
      const isValid = await validForm({
        recipient: rest.recipient,
        frequency: rest.frequency
      });

      if (isValid) {
        await downloadReport({ startDate, endDate, ...rest });
        setCurrentTab(0);
        enqueueSnackbar('Your Download is being prepared!', {
          variant: 'success'
        });
      }
    } catch (error) {
      console.error(error);

      if (error.name === 'ValidationError') {
        dispatch(
          setFormError({
            key: error.path,
            data: error.errors[0]
          })
        );
      } else {
        enqueueSnackbar(ErrorMsg(error), {
          variant: 'error'
        });
      }
    }
  }, [endDate, enqueueSnackbar, rest, setCurrentTab, startDate]);

  const handlePreview = useCallback(() => {
    previewReport(rest);
    setIsPreview(true);
  }, [rest, setIsPreview]);

  const handleUpdate = useCallback(async () => {
    try {
      const isValid = await validForm({
        recipient: rest.recipient,
        frequency: rest.frequency
      });

      if (isValid) {
        await updateReport({ id, ...rest });
        setCurrentTab(0);
        enqueueSnackbar('Report Updated!', {
          variant: 'success'
        });
      }
    } catch (error) {
      if (error.name === 'ValidationError') {
        dispatch(
          setFormError({
            key: error.path,
            data: error.errors[0]
          })
        );
      } else {
        enqueueSnackbar(ErrorMsg(error), {
          variant: 'error'
        });
      }
    }
  }, [enqueueSnackbar, id, rest, setCurrentTab]);

  useEffect(
    () => () => {
      dispatch(resetReport());
    },
    []
  );

  useEffect(() => {
    const getFilters = async () => {
      dispatch(startLoading());
      const response = await getReportFilters();

      const { data, error, isError } = response;

      if (isError || data === null) {
        enqueueSnackbar(error, {
          variant: 'error'
        });
        return;
      }
      if (data !== null) {
        setData([...data]);
      }
      dispatch(stopLoading());
    };

    getFilters();
  }, [enqueueSnackbar]);

  if (isLoading) {
    return (
      <LoadingScreen
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '100vw',
          overflow: 'none',
          background: '#fff',
          zIndex: 99
        }}
      />
    );
  }

  return (
    <>
      <Card
        sx={{
          p: 3
        }}
      >
        <CardHeader title={edit ? 'Edit Parameters' : 'Select Parameters'} />
        <CardContent>
          <Stack spacing={3}>
            <ReportsTopSection />
            <Stack spacing={2}>
              <FiltersWrapperStyle>
                {data.map((d) => (
                  <FilterBoxes key={d.key} title={d.name} options={d.staticData} storeKey={d.key} />
                ))}
              </FiltersWrapperStyle>
            </Stack>
            <Stack>
              <ActiveFilters />
            </Stack>
            <ChooseFrequency />
          </Stack>
        </CardContent>
        <CardActions
          sx={{
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <LoadingButton variant="outlined" onClick={handlePreview}>
            Preview Report
          </LoadingButton>
          <LoadingButton variant="outlined" onClick={handleDownload}>
            Download Report
          </LoadingButton>
          {edit ? (
            <LoadingButton variant="outlined" onClick={handleUpdate}>
              Update Report
            </LoadingButton>
          ) : (
            <LoadingButton variant="outlined" onClick={handleSchedule}>
              Schedule Report
            </LoadingButton>
          )}
        </CardActions>
      </Card>
      <Dialog open={isPreview} onClose={() => setIsPreview(false)} maxWidth="lg">
        <DialogTitle>Preview Report</DialogTitle>
        <DialogContent>
          <Stack>
            <PreviewReport />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPreview(false)}>Close Preview</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GenerateReport;
