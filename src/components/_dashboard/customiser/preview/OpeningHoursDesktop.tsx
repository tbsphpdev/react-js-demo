import { OpeningHourProps } from '@customTypes/blinkPages';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  tableCellClasses,
  Typography,
  Box,
  Divider,
  Stack,
  Chip
} from '@material-ui/core';
import { experimentalStyled as styled } from '@material-ui/core/styles';
import { Mail, Phone } from '@material-ui/icons';

const TableHeadCellStyle = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    color: theme.palette.common.black,
    backgroundColor: theme.palette.background.neutral,
    padding: theme.spacing(1)
  },
  [`&.${tableCellClasses.head}:first-of-type`]: {
    boxShadow: `none`,
    borderBottomLeftRadius: 0
  },
  [`&.${tableCellClasses.head}:last-of-type`]: {
    boxShadow: `none`,
    borderBottomRightRadius: 0
  }
}));
const TABLE_HEADERS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const OpeningHoursDesktop = ({ data, contact }: OpeningHourProps) => (
  <>
    <TableContainer component={Paper}>
      <Table aria-label="Opening Hours" size="small">
        <TableHead>
          <TableRow>
            {TABLE_HEADERS.map((header, idx) => (
              <TableHeadCellStyle align="center" key={`days-${idx}`}>
                {header}
              </TableHeadCellStyle>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            {Object.entries(data).map(([key, value]) => {
              const { close, isClosed, open } = value;

              const { hour: Ohour, minute: Ominute, type: Otype } = open;
              const { hour: Chour, minute: Cminute, type: Ctype } = close;

              return (
                <TableCell align="center" key={key}>
                  <Box>
                    {isClosed ? (
                      <Typography variant="caption" color="textSecondary">
                        Closed
                      </Typography>
                    ) : (
                      <>
                        <Typography variant="caption" color="textSecondary">
                          {`${Ohour}:${Ominute} ${Otype}`}
                        </Typography>
                        <Divider />
                        <Typography variant="caption" color="textSecondary">
                          {`${Chour}:${Cminute} ${Ctype}`}
                        </Typography>
                      </>
                    )}
                  </Box>
                </TableCell>
              );
            })}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
    <Stack
      justifyContent="center"
      alignItems="center"
      direction={{ xs: 'column', sm: 'row' }}
      spacing={{
        xs: 2,
        sm: 3,
        md: 5
      }}
      marginTop={5}
      padding={1}
    >
      {contact?.email && <Chip label={contact.email} icon={<Mail />} />}

      {contact?.phone && <Chip label={contact.phone} icon={<Phone />} />}
    </Stack>
  </>
);

export default OpeningHoursDesktop;
