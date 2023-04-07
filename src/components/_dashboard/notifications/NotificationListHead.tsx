import { TableCell, TableHead, TableRow } from '@material-ui/core';

type NotificationListHeadProps = {
  headLabel: any[];
};

const NotificationListHead = ({ headLabel }: NotificationListHeadProps) => (
  <TableHead>
    <TableRow>
      {headLabel.map((headCell) => (
        <TableCell key={headCell}>{headCell}</TableCell>
      ))}
    </TableRow>
  </TableHead>
);

export default NotificationListHead;
