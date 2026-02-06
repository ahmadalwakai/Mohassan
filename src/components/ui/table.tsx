/**
 * Table Component
 * Accessible, consistent table UI for data display
 */

import { Box, type BoxProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export interface TableProps extends BoxProps {
  children: ReactNode;
}

export interface TableHeaderProps {
  children: ReactNode;
}

export interface TableBodyProps {
  children: ReactNode;
}

export interface TableRowProps {
  children: ReactNode;
}

export interface TableHeadCellProps {
  children: ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface TableCellProps {
  children: ReactNode;
  align?: 'left' | 'center' | 'right';
}

export function Table({ children, ...props }: TableProps) {
  return (
    <Box overflowX="auto" {...props}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        {children}
      </table>
    </Box>
  );
}

export function TableHeader({ children }: TableHeaderProps) {
  return <thead>{children}</thead>;
}

export function TableBody({ children }: TableBodyProps) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children }: TableRowProps) {
  return <tr>{children}</tr>;
}

export function TableHeadCell({ children, align = 'left' }: TableHeadCellProps) {
  return (
    <th
      style={{
        textAlign: align === 'right' ? 'right' : align === 'center' ? 'center' : 'left',
        padding: '12px',
        borderBottom: '2px solid #ccc',
        fontWeight: 600,
      }}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, align = 'left' }: TableCellProps) {
  return (
    <td
      style={{
        textAlign: align === 'right' ? 'right' : align === 'center' ? 'center' : 'left',
        padding: '12px',
        borderBottom: '1px solid #eee',
      }}
    >
      {children}
    </td>
  );
}
