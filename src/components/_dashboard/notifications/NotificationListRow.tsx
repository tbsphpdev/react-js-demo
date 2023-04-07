import { Box, Stack, TableCell, TableRow } from '@material-ui/core';
import { capitalCase } from 'change-case';
import BadgeStatus from 'components/BadgeStatus';
import { NotificationType } from 'redux/slices/notification';
import { fDate, ftimeSuffix } from 'utils/formatTime';

type NotificationListRowProps = {
  notification: NotificationType;
};

const NotificationListRow = ({ notification }: NotificationListRowProps) => {
  const {
    amount,
    currSymbol,
    createdAt,
    description,
    notifStatus,
    notifType,
    viewStatus,
    customerName
  } = notification;

  const type = notifType.toLowerCase() === 'vt' ? 'VT' : capitalCase(notifType);
  return (
    <TableRow>
      <TableCell>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box>
            <BadgeStatus status={viewStatus ? 'read' : 'unread'} size="small" />
          </Box>
          <Box>{`${type} ${capitalCase(notifStatus)}`}</Box>
        </Stack>
      </TableCell>
      <TableCell>
        <Stack>
          <Stack>{fDate(createdAt)}</Stack>
          <Stack>{ftimeSuffix(createdAt)}</Stack>
        </Stack>
      </TableCell>
      <TableCell>{customerName}</TableCell>
      <TableCell>
        {currSymbol} {amount}
      </TableCell>
      <TableCell>{description}</TableCell>
    </TableRow>
  );
};

export default NotificationListRow;
