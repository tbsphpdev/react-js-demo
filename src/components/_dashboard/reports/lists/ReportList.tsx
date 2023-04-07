import { ReportItem } from '@customTypes/report';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  experimentalStyled as styled,
  IconButton,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@material-ui/core';
import {
  KeyboardArrowUp,
  KeyboardArrowDown,
  SettingsBackupRestore,
  HourglassTop,
  DownloadDoneOutlined
} from '@material-ui/icons';
import { LoadingButton } from '@material-ui/lab';
import { capitalCase } from 'change-case';
import { TableSkeletonLoad } from 'components/common';
import Label from 'components/Label';
import Confirmation from 'components/MessageDialogs/Confirmation';
import useToggle from 'hooks/useToggle';
import { useCallback, useEffect, useState } from 'react';
import { getReportsList, setReport } from 'redux/slices/reports';
import { dispatch, RootState, useSelector } from 'redux/store';
import { deleteReport, pauseReport, resumeReport } from '_apis_/report';

type PropTypes = {
  setCurrentTab: React.Dispatch<React.SetStateAction<number>>;
};

type RowProps = {
  l: ReportItem;
  handlePause: (id: string) => void;
  handleResume: (id: string) => void;
  handleDelete: (id: string) => void;
  handleEdit: (l: any) => void;
};

const TABLE_HEADERS = ['Name', 'Frequency', 'Recipients', 'Status'];

const ReportRowStyle = styled(TableRow)({
  borderBottom: '1px solid',
  borderColor: '#f4f6f8'
});

const ReportList = ({ setCurrentTab }: PropTypes) => {
  const { list, isLoading } = useSelector((state: RootState) => state.reports);
  useEffect(() => {
    dispatch(getReportsList());
  }, []);

  const handlePause = useCallback(async (id: string) => {
    await pauseReport(id);
    dispatch(getReportsList());
  }, []);

  const handleResume = useCallback(async (id: string) => {
    await resumeReport(id);
    dispatch(getReportsList());
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    await deleteReport(id);
    dispatch(getReportsList());
  }, []);

  const handleEdit = useCallback(
    (l) => {
      const report = {
        blinkTransactionType: l.blinkTransactionType ? l.blinkTransactionType?.split(',') : [],
        status: l.status ? l.status?.split(',') : [],
        transactionType: l?.transactionType ? l?.transactionType?.split(',') : [],
        cardType: l.cardType ? l.cardType?.split(',') : [],
        cardSchemes: l.cardSchemes ? l.cardSchemes?.split(',') : [],
        accquire: l.accquire ? l.accquire?.split(',') : []
      };
      dispatch(setReport({ ...l, ...report }));
      setCurrentTab(0);
    },
    [setCurrentTab]
  );

  return (
    <Card sx={{ p: 3 }}>
      <CardHeader title="My Reports" />
      <CardContent>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell />
                {TABLE_HEADERS.map((head) => (
                  <TableCell key={head}>{capitalCase(head)}</TableCell>
                ))}
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && <TableSkeletonLoad colSpan={TABLE_HEADERS.length + 2} rows={3} />}

              {list.map((l, index) => (
                <Row
                  l={l}
                  key={index}
                  handlePause={handlePause}
                  handleResume={handleResume}
                  handleDelete={handleDelete}
                  handleEdit={handleEdit}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default ReportList;

const ROW_STATUS = {
  success: ['schedule'],
  error: [],
  info: ['resume', 'download'],
  warning: ['pause']
};

const Row = ({ l, handleDelete, handleEdit, handlePause, handleResume }: RowProps) => {
  const [open, setOpen] = useState(false);
  const [isPauseOpen, setPauseOpen] = useToggle(false);
  const [isResumeOpen, setResumeOpen] = useToggle(false);
  const [isDeleteOpen, setDeleteOpen] = useToggle(false);

  const handlePauseAction = (action: boolean) => {
    if (action) {
      handlePause(l.id);
    }
    setPauseOpen(false);
  };

  const handleResumeAction = (action: boolean) => {
    if (action) {
      handleResume(l.id);
    }
    setResumeOpen(false);
  };

  const handleDeleteAction = (action: boolean) => {
    if (action) {
      handleDelete(l.id);
    }
    setDeleteOpen(false);
  };

  return (
    <>
      <ReportRowStyle>
        {l.reptSch.length > 0 ? (
          <TableCell>
            <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </TableCell>
        ) : (
          <TableCell />
        )}
        {l.state === 'Download' ? (
          <TableCell colSpan={3}>
            {l.reptSch.length < 1 ? (
              <Stack direction="row" spacing={1}>
                <Typography>Your Report download is being prepared.</Typography>
                <HourglassTop />
              </Stack>
            ) : (
              <Stack direction="row" spacing={1}>
                <Typography>Your Report is ready to be downloaded.</Typography>
                <DownloadDoneOutlined />
              </Stack>
            )}
          </TableCell>
        ) : (
          <>
            <TableCell>
              <Typography noWrap textOverflow="ellipsis" variant="body2" component="p">
                {l.name}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography noWrap textOverflow="ellipsis" variant="body2" component="p">
                {l.frequencyType}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography noWrap textOverflow="ellipsis" variant="body2" component="p">
                {l.recipient}
              </Typography>
            </TableCell>
          </>
        )}
        <TableCell>
          <Label
            color={
              (ROW_STATUS.warning.includes(l.state.toLowerCase()) && 'warning') ||
              (ROW_STATUS.success.includes(l.state.toLowerCase()) && 'success') ||
              (ROW_STATUS.info.includes(l.state.toLowerCase()) && 'info') ||
              'error'
            }
          >
            {l.state}
          </Label>
        </TableCell>
        <TableCell>
          <Stack direction="row" spacing={2}>
            {l.state !== 'Download' && (
              <>
                {l.state?.toLowerCase() === 'pause' ? (
                  <LoadingButton variant="outlined" onClick={() => setResumeOpen(true)}>
                    Resume
                  </LoadingButton>
                ) : (
                  <LoadingButton variant="outlined" onClick={() => setPauseOpen(true)}>
                    Pause
                  </LoadingButton>
                )}

                <LoadingButton variant="outlined" onClick={() => handleEdit(l)}>
                  Edit
                </LoadingButton>
                <LoadingButton variant="outlined" color="error" onClick={() => setDeleteOpen(true)}>
                  Delete Report
                </LoadingButton>
              </>
            )}
          </Stack>
        </TableCell>
      </ReportRowStyle>
      {l.reptSch.length > 0 && (
        <ReportRowStyle>
          <TableCell
            colSpan={TABLE_HEADERS.length}
            sx={{
              py: 0
            }}
          >
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Typography variant="body1" gutterBottom component="div">
                  Previous reports
                </Typography>
                <Table size="small">
                  <TableBody>
                    {l.reptSch.slice(0, 3).map((d, idx) => (
                      <TableRow key={idx}>
                        <TableCell align="left">
                          <Typography textOverflow="ellipsis" noWrap variant="body2">
                            <Button startIcon={<SettingsBackupRestore color="disabled" />}>
                              <Link href={d.reportURL} target="_blank" rel="noreferrer">
                                Download Report {idx + 1}
                              </Link>
                            </Button>
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </ReportRowStyle>
      )}
      <Confirmation open={isPauseOpen} msg="Pause this report" closeAction={handlePauseAction} />
      <Confirmation open={isResumeOpen} msg="Resume this report" closeAction={handleResumeAction} />
      <Confirmation open={isDeleteOpen} msg="Delete this report" closeAction={handleDeleteAction} />
    </>
  );
};
