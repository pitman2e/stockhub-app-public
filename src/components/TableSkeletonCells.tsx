import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Skeleton from '@mui/material/Skeleton';

interface ITableSkeletonCellsProps {
  rowsPerPage: number;
  colCount: number;
  rowKeyPrefix?: string;
}

export default function TableSkeletonCells({ rowsPerPage, colCount, rowKeyPrefix = '' }: ITableSkeletonCellsProps) {
  return (
    <>
      {[...Array(rowsPerPage).keys()].map((rowIndex) => (
        <TableRow key={`${rowKeyPrefix}skeleton-row-${rowIndex}`}>
          {[...Array(colCount).keys()].map((cellIndex) => (
            <TableCell key={`${rowKeyPrefix}skeleton-cell-${rowIndex}-${cellIndex}`}>
              <Skeleton />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
