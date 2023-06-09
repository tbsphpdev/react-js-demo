import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useSnackbar } from 'notistack';
import copyFill from '@iconify/icons-eva/copy-fill';
import { CopyToClipboard } from 'react-copy-to-clipboard';
// material
import { Tooltip, TextField, IconButton, InputAdornment } from '@material-ui/core';

// ----------------------------------------------------------------------

type CopyClipboardProps = {
  value: string;
  fullWidth?: boolean;
};

export default function CopyClipboard({ value, fullWidth = false, ...other }: CopyClipboardProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [state, setState] = useState({
    value,
    copied: false
  });

  const onCopy = () => {
    setState({ ...state, copied: true });
    if (state.value) {
      enqueueSnackbar('Copied', { variant: 'success' });
    }
  };

  return (
    <TextField
      fullWidth={fullWidth}
      value={state.value}
      InputProps={{
        readOnly: true,
        endAdornment: (
          <InputAdornment position="end">
            <CopyToClipboard text={state.value} onCopy={onCopy}>
              <Tooltip title="Copy">
                <IconButton>
                  <Icon icon={copyFill} width={24} height={24} />
                </IconButton>
              </Tooltip>
            </CopyToClipboard>
          </InputAdornment>
        )
      }}
      {...other}
    />
  );
}
