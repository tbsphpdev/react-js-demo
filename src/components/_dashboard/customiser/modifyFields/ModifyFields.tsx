import {
  Box,
  FormControlLabel,
  Switch,
  Stack,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField
} from '@material-ui/core';
import { experimentalStyled as styled } from '@material-ui/core/styles';
import { LoadingButton } from '@material-ui/lab';
import Confirmation from 'components/MessageDialogs/Confirmation';
import useToggle from 'hooks/useToggle';
import { omit, pick } from 'lodash';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';
import {
  getSingleBlinkPage,
  handleFields,
  resetDefaultField,
  resetFieldsChanges
} from 'redux/slices/customiser';
import { RootState, useDispatch, useSelector } from 'redux/store';
import axiosInstance from 'utils/axios';
import { API_BASE_URLS } from 'utils/constant';

const fieldsWithVisible = ['description', 'orderRef'];

function createData(
  key: string,
  visible: string,
  required: string,
  displayNameValue: string,
  displayNamePlaceHolder: string,
  descriptorValue: string,
  descriptorPlaceHolder: string,
  isRequired: boolean,
  readOnly: string
) {
  return {
    key,
    visible,
    required,
    displayNameValue,
    displayNamePlaceHolder,
    descriptorValue,
    descriptorPlaceHolder,
    readOnly
  };
}

const ComponentStyle = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.grey[300]}`,
  borderRadius: theme.shape.borderRadius
}));

const HeaderRowStyle = styled(TableRow)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.grey[300]}`
}));

const TableHeadCellStyle = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    color: theme.palette.common.black,
    backgroundColor: theme.palette.common.white
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

const TableRowStyle = styled(TableRow)(({ theme }) => ({
  position: 'relative',

  '::after': {
    content: '""',
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
    height: '1px',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    width: '95%',
    transform: `translate(-50%, -50%)`
  },
  // hide last border
  '&:last-child::after': {
    border: 0
  }
}));

const ModifyFields = () => {
  const { fields, id } = useSelector((state: RootState) => state.customiser);
  const [isConfirmOpen, setIsConfirmOpen] = useToggle(false);
  const [isResetOpen, setIsResetOpen] = useToggle(false);
  const [isLoading, setIsLoading] = useToggle(false);

  const { enqueueSnackbar } = useSnackbar();

  const dispatch = useDispatch();

  const usableFields = pick(fields, [
    'customerFirstName',
    'customerLastName',
    'customerEmail',
    'description',
    'orderRef'
  ]);

  const addressFields = omit(fields.customerAddress, ['address2']);

  const amountField = pick(fields, ['rawAmount']);

  const rows = Object.entries(usableFields).map(([key, value]) =>
    createData(
      key,
      value.visible,
      value.required,
      value.displayNameValue || '',
      value.displayNamePlaceHolder,
      value.descriptorValue,
      value.descriptorPlaceHolder,
      value.isRequired,
      value.readOnly
    )
  );

  const addressRows = Object.entries(addressFields).map(([key, value]) =>
    createData(
      key,
      value.visible,
      value.required,
      value.displayNameValue || '',
      value.displayNamePlaceHolder,
      value.descriptorValue,
      value.descriptorPlaceHolder,
      value.isRequired,
      value.readOnly
    )
  );

  const amountRow = Object.entries(amountField).map(([key, value]) =>
    createData(
      key,
      value.visible,
      value.required,
      value.displayNameValue || '',
      value.displayNamePlaceHolder,
      value.descriptorValue,
      value.descriptorPlaceHolder,
      value.isRequired,
      value.readOnly
    )
  );

  const handleSubmit = useCallback(async () => {
    try {
      setIsLoading(true);
      const url: string = `${API_BASE_URLS.blinkpage}/blinkpages`;

      const formData = new FormData();
      if (id) {
        formData.append('id', id);
        formData.append('fields', JSON.stringify(fields));
        await axiosInstance.put(url, formData);
        dispatch(getSingleBlinkPage(id));
        enqueueSnackbar('Updated Successfully', { variant: 'success' });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, enqueueSnackbar, fields, id, setIsLoading]);

  const handleDialogActions = (action: boolean) => {
    if (action) {
      handleRevertChanges();
    }
    setIsConfirmOpen(false);
  };

  const handleRevertChanges = useCallback(() => {
    dispatch(resetFieldsChanges(id));
  }, [dispatch, id]);

  const handleResetActions = (action: boolean) => {
    if (action) {
      handleResetDefault();
    }
    setIsResetOpen(false);
  };

  const handleResetDefault = useCallback(() => {
    if (id) {
      dispatch(resetDefaultField(id, 'modify'));
    }
  }, [dispatch, id]);

  return (
    <Stack spacing={5}>
      <Stack spacing={3}>
        <Typography variant="h5">Modify Fields</Typography>
        <TableContainer component={ComponentStyle}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <HeaderRowStyle>
                <TableHeadCellStyle>All Fields</TableHeadCellStyle>
                <TableHeadCellStyle align="right">Display Name</TableHeadCellStyle>
                <TableHeadCellStyle align="right">URL Descriptor</TableHeadCellStyle>
              </HeaderRowStyle>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <SingleFieldRow row={row} key={index} fieldType="other" />
              ))}
              {addressRows.map((row, index) => (
                <SingleFieldRow row={row} key={index} fieldType="address" />
              ))}

              {amountRow.map((row, index) => (
                <SingleFieldRow row={row} key={index} fieldType="amount" />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
      <Stack spacing={3} direction={{ xs: 'column', sm: 'row' }}>
        <LoadingButton
          color="primary"
          variant="contained"
          size="large"
          onClick={handleSubmit}
          loading={isLoading}
        >
          Save Changes
        </LoadingButton>
        <LoadingButton
          color="inherit"
          variant="contained"
          size="large"
          onClick={() => setIsConfirmOpen(true)}
        >
          Revert Changes
        </LoadingButton>
        <LoadingButton
          color="error"
          variant="outlined"
          size="large"
          onClick={() => setIsResetOpen(true)}
        >
          Reset to Default
        </LoadingButton>
        <Confirmation
          open={isConfirmOpen}
          msg="Revert the changes"
          closeAction={handleDialogActions}
        />
        <Confirmation
          open={isResetOpen}
          msg="Reset the modify fields to the default"
          closeAction={handleResetActions}
        />
      </Stack>
    </Stack>
  );
};

export default ModifyFields;

type PropsType = {
  row: {
    key: string;
    visible: string;
    required: string;
    displayNameValue: string;
    displayNamePlaceHolder: string;
    descriptorValue: string;
    descriptorPlaceHolder: string;
    readOnly: string;
  };
  fieldType: 'address' | 'amount' | 'other';
};

const SingleFieldRow = ({ row, fieldType }: PropsType) => {
  const { key, ...rest } = row;

  const dispatch = useDispatch();

  const handleVisibility = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;

    dispatch(
      handleFields({
        type: key,
        data: {
          ...rest,
          visible: checked ? '1' : '0'
        },
        fieldType
      })
    );
  };
  const handleRequired = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;

    dispatch(
      handleFields({
        type: key,
        data: {
          ...rest,
          required: checked ? '1' : '0'
        },
        fieldType
      })
    );
  };

  const handleReadonly = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;

    dispatch(
      handleFields({
        type: key,
        data: {
          ...rest,
          readOnly: checked ? '1' : '0'
        },
        fieldType
      })
    );
  };
  const handleDisplayName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    dispatch(
      handleFields({
        type: key,
        data: {
          ...rest,
          displayNameValue: value
        },
        fieldType
      })
    );
  };
  const handleURLDescriptor = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    dispatch(
      handleFields({
        type: key,
        data: {
          ...rest,
          descriptorValue: value
        },
        fieldType
      })
    );
  };
  return (
    <TableRowStyle
      key={row.displayNamePlaceHolder}
      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
    >
      <TableCell component="th" scope="row">
        <Stack direction="row" spacing={3}>
          <FormControlLabel
            control={<Switch checked={row.readOnly === '1'} onChange={handleReadonly} />}
            label="Readonly"
          />
          {fieldType === 'other' && (
            <FormControlLabel
              control={<Switch checked={row.required === '1'} onChange={handleRequired} />}
              label="Required"
            />
          )}
          {fieldsWithVisible.includes(key) && (
            <FormControlLabel
              control={<Switch checked={row.visible === '1'} onChange={handleVisibility} />}
              label="Visibility"
            />
          )}
        </Stack>
      </TableCell>
      <TableCell align="right">
        <TextField
          size="small"
          InputLabelProps={{
            shrink: true
          }}
          placeholder={row.displayNamePlaceHolder}
          value={row.displayNameValue}
          onChange={handleDisplayName}
        />
      </TableCell>
      <TableCell align="right">
        <TextField
          size="small"
          InputLabelProps={{
            shrink: true
          }}
          value={row.descriptorValue}
          placeholder={row.descriptorPlaceHolder}
          onChange={handleURLDescriptor}
        />
      </TableCell>
    </TableRowStyle>
  );
};
