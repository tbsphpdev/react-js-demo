import { recentTransactionState } from '@customTypes/transaction';
import { Card, CardContent } from '@material-ui/core';

interface Props {
  row: recentTransactionState;
  receiptTemplate: string;
  receiptTemplateLoading: boolean;
}

export const TransactionReceipt = ({ row, receiptTemplate, receiptTemplateLoading }: Props) => (
  <Card>
    <CardContent>
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: receiptTemplate }} />
    </CardContent>
  </Card>
);
