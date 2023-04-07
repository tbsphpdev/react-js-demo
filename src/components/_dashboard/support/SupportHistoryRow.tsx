import {
  Collapse,
  IconButton,
  makeStyles,
  Stack,
  TableCell,
  TableRow,
  Tooltip,
  Typography
} from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { sentenceCase } from 'change-case';
import Label from 'components/Label';
import { useState } from 'react';
import { fDateMonthMin, ftimeSuffix } from 'utils/formatTime';
// ----------------------------------------------------------------------

const useStyles = makeStyles({
  mainrow: {
    borderBottom: '1px solid #f4f6f8'
  }
});

interface Props {
  row: historydata;
  index: number;
}

type historydata = {
  caseId: string;
  caseNumber: string;
  createdDate: string;
  salesforceOwnerId: {
    name: string;
    ownerId: string;
  };
  status: string;
  subject: string;
};

const SupportHistoryRow = ({ row, index }: Props) => {
  const [openCollapse, setOpenCollapse] = useState(false);
  const classes = useStyles();
  const theme = useTheme();

  return (
    <>
      <TableRow className={classes.mainrow}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpenCollapse(!openCollapse)}
          >
            {openCollapse ? <ArrowDropUpIcon /> : <ArrowRightIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Stack>
            <Typography>{fDateMonthMin(row.createdDate)}</Typography>
            <Typography>{ftimeSuffix(row.createdDate)}</Typography>
          </Stack>
        </TableCell>
        <TableCell>{row.caseNumber}</TableCell>
        <TableCell>
          {row.subject.length < 30 ? (
            <Typography>{row.subject}</Typography>
          ) : (
            <Tooltip title={row.subject}>
              <Typography>{`${row.subject.slice(0, 30)}...`}</Typography>
            </Tooltip>
          )}
        </TableCell>
        <TableCell>
          <Label
            variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
            color={(row.status === 'Open' && 'error') || 'success'}
          >
            {sentenceCase(row.status)}
          </Label>
        </TableCell>
      </TableRow>
      <TableRow className={`${openCollapse ? classes.mainrow : ''}`}>
        <TableCell style={{ padding: 0 }} colSpan={20}>
          <Collapse in={openCollapse} timeout="auto" unmountOnExit>
            <Stack direction="row" sx={{ margin: 1 }}>
              <Stack direction="row" sx={{ p: 3 }}>
                <Typography>Support Member:</Typography>
                {row.salesforceOwnerId && <Typography>{row.salesforceOwnerId.name}</Typography>}
              </Stack>
            </Stack>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default SupportHistoryRow;
