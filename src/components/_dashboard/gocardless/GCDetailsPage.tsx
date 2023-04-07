import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  Divider,
  Grid,
  Stack,
  Typography,
  useTheme
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useState, useCallback } from 'react';
import GCCustomerBankAccounts from './GCCustomerBankAccounts';
import GCCustomerDetails from './GCCustomerDetails';
import GCCustomerOneOffPayments from './GCCustomerOneOffPayments';
import GCCustomerSubscriptions from './GCCustomerSubscriptions';

const GCDetailsPage = () => {
  const theme = useTheme();
  const [customer, setCustomer] = useState({ name: '' });

  const updateCustomer = useCallback((val: string) => {
    setCustomer({ name: val });
  }, []);

  return (
    <Stack>
      <Card sx={{ padding: 3 }}>
        <Stack spacing={4} direction="column">
          <Stack>
            <Grid container spacing={5}>
              <Grid item sm={5} xs={12}>
                <GCCustomerDetails setCustomer={updateCustomer} />
              </Grid>
              <Grid item sm={7} xs={12}>
                <GCCustomerBankAccounts />
              </Grid>
            </Grid>
          </Stack>
          <Stack>
            <Accordion sx={{ boxShadow: `0px 1px 3px black` }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography sx={{ color: theme.palette.text.primary }}>Subscriptions</Typography>
              </AccordionSummary>
              <Divider />
              <AccordionDetails>
                <GCCustomerSubscriptions customer={customer} />
              </AccordionDetails>
            </Accordion>
          </Stack>
          <Stack>
            <Accordion sx={{ boxShadow: `0px 1px 3px black` }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography sx={{ color: theme.palette.text.primary }}>One-Off Payments</Typography>
              </AccordionSummary>
              <Divider />
              <AccordionDetails>
                <GCCustomerOneOffPayments customer={customer} />
              </AccordionDetails>
            </Accordion>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
};

export default GCDetailsPage;
