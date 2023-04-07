import { useState } from 'react';
import { Box, Card, Stack, Tabs, Tab } from '@material-ui/core';
import HeaderBreadcrumbs from 'components/HeaderBreadcrumbs';
import { PATH_DASHBOARD } from 'routes/paths';
import GCCustomerTable from './GCCustomerTable';
import GCPaymentTable from './GCPaymentTable';

const GCHome = () => {
  const [currentTab, setCurrentTab] = useState('Customers');

  return (
    <>
      <HeaderBreadcrumbs
        heading="Go Cardless"
        links={[{ name: 'Dashboard', href: PATH_DASHBOARD.root }, { name: currentTab }]}
      />

      <Stack>
        <Box sx={{ width: '100%' }}>
          <Tabs
            value={currentTab}
            onChange={(e: any, val: string) => {
              setCurrentTab(val);
            }}
            textColor="secondary"
            indicatorColor="secondary"
            aria-label="secondary tabs example"
          >
            <Tab value="Customers" label="Customers" />
            <Tab value="Payments" label="Payments" />
          </Tabs>
        </Box>
        <Box>
          <Card sx={{ p: 3, pb: 12, display: currentTab === 'Customers' ? 'block' : 'none' }}>
            <Stack spacing={3}>
              <GCCustomerTable />
            </Stack>
          </Card>
          <Card sx={{ p: 3, pb: 12, display: currentTab === 'Payments' ? 'block' : 'none' }}>
            <Stack spacing={3}>
              <GCPaymentTable />
            </Stack>
          </Card>
        </Box>
      </Stack>
    </>
  );
};

export default GCHome;
