import { useEffect, useState } from 'react';
import axiosInstance from 'utils/axios';
import {
  makeStyles,
  Box,
  Container,
  Card,
  CardHeader,
  CircularProgress,
  Stack,
  Grid,
  Divider,
  Typography,
  Tab,
  Tabs,
  Button
} from '@material-ui/core';
import { API_BASE_URLS } from 'utils/constant';
import { MerchantAccountDetails, MerchantAccountState } from '@customTypes/transaction';
import { useSnackbar } from 'notistack';
import { ErrorMsg } from 'utils/helpError';
import { capitalCase } from 'change-case';
import SalesforceMerchant from './SalesforceMerchant';
import SalesforceInvoice from './SalesforceInvoice';
import SalesforceGateways from './SalesforceGateways';
import SalesforceTerminal from './SalesforceTerminal';
import SalesforceSupportHistory from './SalesforceSupportHistory';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%'
  },
  heading: {
    margin: 0
  },
  selectmergrid: {
    paddingLeft: '9px'
  },
  paper: {
    marginBottom: '17px !important',
    padding: '2px 14px',
    justifyContent: 'center'
  },
  progress: {
    marginTop: '27px'
  },
  buttoncontainer: {
    padding: '16px 10px 16px 10px',
    justifyContent: 'space-between'
  },
  divider: {
    margin: '10px'
  },
  activeButton: {
    color: '#0045FF',
    backgroundColor: 'rgba(145, 158, 171, 0.08)'
  },
  Button: {
    color: '#919EAB',
    backgroundColor: 'rgb(145, 158, 171, 0)'
  },
  tableHeading: {
    padding: '10px',
    fontWeight: 500
  },
  cardContentspace: {
    justifyContent: 'space-between'
  },
  cardContentpadding: {
    padding: '16px'
  },
  cardpadding: {
    paddingBottom: '15px'
  },
  inactivecard: {
    borderStyle: 'none'
  },
  activecard: {
    borderStyle: 'solid',
    borderColor: '#0ca8f3'
  },
  checkbox: {
    marginLeft: '0px !important'
  },
  carddetails: {
    padding: '16px',
    justifyContent: 'space-between',
    backgroundColor: '#f4f6f8',
    borderTop: '1px solid #f4f6f8'
  },
  carddetailsmargin: {
    margin: '0px -16px -16px -16px !important'
  },
  detailsHeader: {
    justifyContent: 'space-between'
  },
  viewallbtn: {
    marginBottom: '15px'
  },
  mrl5: {
    margin: '0px 6px'
  }
}));
const ACCOUNT_TABS = ['Invoices', 'Gateways', 'Terminal'];

const SalesforceIndex = () => {
  const [merchantaccountData, setMerchantAccountData] = useState<MerchantAccountState[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [selectedAccounts, setselectedAccounts] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [isLoadingDetails, setisLoadingDetails] = useState(false);
  const [AccountDetails, setAccountDetails] = useState<MerchantAccountDetails>({
    invoicedata: [],
    gatewaydata: [],
    terminaldata: [],
    historydata: []
  });
  const [totalselecacc, setTotalselecacc] = useState('');
  const [section, setSection] = useState('Invoices');

  const handleselectAll = async (event: any) => {
    const accountdata = [...merchantaccountData];
    const selectedacc: string[] = [];
    accountdata.forEach((val) => {
      val.checked = true;
      selectedacc.push(val.merchantId);
    });
    getDetails(selectedacc.join(','));

    setMerchantAccountData(accountdata);
    setselectedAccounts(selectedacc);
    selectedAccnumber(selectedacc);
  };

  const selectedAccnumber = (selectarr: string[]) => {
    if (selectarr.length === 0) {
      setTotalselecacc('');
    } else if (selectarr.length !== 0) {
      if (selectarr.length === merchantaccountData.length) {
        setTotalselecacc('All');
      } else {
        setTotalselecacc(`${selectarr.length}`);
      }
    }
  };

  const handleCheckbox = async (tick: boolean, ID: string) => {
    if (merchantaccountData.length === 1) return;
    const accountdata = [...merchantaccountData];
    const selectedacc = [...selectedAccounts];
    accountdata.forEach((val, i) => {
      if (ID === val.merchantId) {
        val.checked = tick;
      }
    });
    if (tick === true) {
      selectedacc.push(ID);
      accountdata.length === selectedacc.length && setChecked(true);
    } else if (tick === false) {
      selectedacc.splice(selectedacc.indexOf(ID), 1);
      checked === true && setChecked(false);
    }
    setMerchantAccountData(accountdata);
    setselectedAccounts(selectedacc);
    selectedAccnumber(selectedacc);

    selectedacc.length !== 0
      ? getDetails(selectedacc.join(','))
      : setAccountDetails((prevState: MerchantAccountDetails) => ({
          ...prevState,
          invoicedata: [],
          gatewaydata: [],
          terminaldata: [],
          historydata: []
        }));
  };

  const getDetails = async (id: String) => {
    setisLoadingDetails(true);
    try {
      const url: string = `${API_BASE_URLS.salesforce}/account/salesforces/merchants?salesforceId=${id}`;
      const { data } = await axiosInstance.get(url);
      let invoice: any[] = [];
      let gateways: any[] = [];
      let terminals: any[] = [];
      let history: any[] = [];
      data.message.forEach((val: any) => {
        invoice = [...invoice, ...val.salesforceInvoicesId];
        gateways = [...gateways, ...val.salesforceGateway];
        history = [...history, ...val.salesforceCasesId];
        terminals = [...terminals, ...val.salesforceTerminal];
      });

      setAccountDetails((prevState: MerchantAccountDetails) => ({
        ...prevState,
        invoicedata: [...invoice],
        gatewaydata: [...gateways],
        terminaldata: [...terminals],
        historydata: [...history]
      }));
    } catch (error) {
      console.error(error, 'error');
      enqueueSnackbar(ErrorMsg(error), {
        variant: 'error'
      });
    } finally {
      setisLoadingDetails(false);
    }
  };

  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const url: string = `${API_BASE_URLS.salesforce}/account/salesforces`;
        const { data } = await axiosInstance.get(url);

        const accountData = data.message.sfAccountId.salesforceAccountId;

        if (accountData.length === 1) {
          setMerchantAccountData(
            accountData.map((a: MerchantAccountState) => ({ ...a, checked: true }))
          );
          setselectedAccounts([accountData[0].merchantId]);
          setTotalselecacc('All');
          getDetails(accountData[0].merchantId);
        } else {
          setMerchantAccountData(accountData);
        }
      } catch (error) {
        enqueueSnackbar(ErrorMsg(error), {
          variant: 'error'
        });
        console.error(error);
      } finally {
        setIsLoadingAccounts(false);
      }
    };

    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enqueueSnackbar]);

  return (
    <Box className={classes.root}>
      <Container maxWidth="xl">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} className={classes.selectmergrid}>
            <Card>
              {!isLoadingAccounts && merchantaccountData.length !== 0 && (
                <CardHeader title="Select Account(s)" sx={{ mb: 3 }} />
              )}
              <Stack
                className={classes.paper}
                spacing={{ xs: 3, sm: 6, md: 6 }}
                direction={{ xs: 'column', sm: 'row' }}
              >
                {!isLoadingAccounts && merchantaccountData.length !== 0 && (
                  <Grid container spacing={2}>
                    <SalesforceMerchant
                      checked={checked}
                      handleselectAll={handleselectAll}
                      handleCheckbox={handleCheckbox}
                      isLoadingAccounts={isLoadingAccounts}
                      merchantaccountData={merchantaccountData}
                      classes={classes}
                    />
                  </Grid>
                )}
                {!isLoadingAccounts && merchantaccountData.length === 0 && (
                  <Stack>
                    <Typography>No Merchant Found</Typography>
                  </Stack>
                )}
                {isLoadingAccounts && (
                  <Stack>
                    <CircularProgress color="inherit" size={40} />
                  </Stack>
                )}
              </Stack>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1, sm: 1 }}
                className={classes.buttoncontainer}
              >
                <Tabs
                  value={section}
                  scrollButtons="auto"
                  variant="scrollable"
                  allowScrollButtonsMobile
                  onChange={(e, value) => setSection(value)}
                >
                  {ACCOUNT_TABS.map((tab) => (
                    <Tab disableRipple key={tab} label={capitalCase(tab)} value={tab} />
                  ))}
                </Tabs>
              </Stack>
              <Stack>
                <Divider className={classes.divider} />
              </Stack>

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                className={classes.mrl5}
              >
                {totalselecacc !== '' && (
                  <Typography className={classes.tableHeading}>
                    {totalselecacc !== '' && `${totalselecacc} Accounts Selected`}
                  </Typography>
                )}
                {totalselecacc !== '' && totalselecacc !== 'All' && (
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleselectAll}
                    className={classes.viewallbtn}
                  >
                    View All
                  </Button>
                )}
              </Stack>

              <Stack className={classes.paper}>
                {section === 'Invoices' && (
                  <SalesforceInvoice
                    InvoiceDetails={AccountDetails.invoicedata}
                    isLoadingDetails={isLoadingDetails}
                    classes={classes}
                    selectedAccounts={totalselecacc}
                    handleselectAll={handleselectAll}
                  />
                )}
                {section === 'Gateways' && (
                  <SalesforceGateways
                    GatewayDetails={AccountDetails.gatewaydata}
                    isLoadingDetails={isLoadingDetails}
                    classes={classes}
                    selectedAccounts={totalselecacc}
                    handleselectAll={handleselectAll}
                  />
                )}
                {section === 'Terminal' && (
                  <SalesforceTerminal
                    TerminalDetails={AccountDetails.terminaldata}
                    isLoadingDetails={isLoadingDetails}
                    classes={classes}
                    selectedAccounts={totalselecacc}
                    handleselectAll={handleselectAll}
                  />
                )}
                {section === 'Support History' && (
                  <SalesforceSupportHistory
                    HistoryDetails={AccountDetails.historydata}
                    isLoadingDetails={isLoadingDetails}
                    classes={classes}
                    selectedAccounts={totalselecacc}
                    handleselectAll={handleselectAll}
                  />
                )}
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default SalesforceIndex;
