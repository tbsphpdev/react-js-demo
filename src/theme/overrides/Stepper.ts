import { Theme } from '@material-ui/core/styles';

// ----------------------------------------------------------------------

export default function Stepper(theme: Theme) {
  return {
    MuiStepConnector: {
      styleOverrides: {
        line: {
          borderColor: theme.palette.divider
        }
      }
    },
    MuiStepContent: {
      styleOverrides: {
        root: {
          borderColor: theme.palette.divider
        }
      }
    },
    MuiStepLabel: {
      styleOverrides: {
        iconContainer: {
          '& .MuiStepIcon-text': {
            fill: theme.palette.common.white
          },
          '& .MuiStepIcon-root:not(.Mui-active)': {
            fill: theme.palette.text.disabled
          }
        }
      }
    }
  };
}
