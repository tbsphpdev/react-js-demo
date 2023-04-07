import { TableRow, TableCell, Box, Skeleton } from '@material-ui/core';

type TableSkeletonLoadProps = {
  colSpan: number;
  rows?: number;
};

const TableSkeletonLoad = ({ colSpan, rows = 3 }: TableSkeletonLoadProps) => {
  const Boxes = [...Array(rows)].map((_r, i) => (
    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }} key={i}>
      <Skeleton
        width="100%"
        height={50}
        variant="rectangular"
        sx={{ borderRadius: 2 }}
        animation="wave"
      />
    </Box>
  ));

  return (
    <TableRow>
      <TableCell colSpan={colSpan}>{Boxes}</TableCell>
    </TableRow>
  );
};

export default TableSkeletonLoad;
