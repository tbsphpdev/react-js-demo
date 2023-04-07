import { Card, Typography } from '@material-ui/core';
import { alpha, experimentalStyled as styled } from '@material-ui/core/styles';
import TerminalIcon from 'assets/icon_terminal';
// ----------------------------------------------------------------------

const RootStyle = styled(Card)(({ theme }) => ({
  boxShadow: 'none',
  textAlign: 'center',
  padding: theme.spacing(3, 0),
  color: theme.palette.primary.darker,
  backgroundColor: '#d3f6f3e0',
  cursor: 'pointer'
}));

const IconWrapperStyle = styled('div')(({ theme }) => ({
  margin: 'auto',
  display: 'flex',
  borderRadius: '50%',
  alignItems: 'center',
  width: theme.spacing(6),
  height: theme.spacing(6),
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
  color: theme.palette.primary.dark,
  backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0)} 0%, ${alpha(
    theme.palette.primary.dark,
    0.24
  )} 100%)`
}));

const TerminalBtn = ({ setFieldValue, values, classes }: any) => (
  <RootStyle
    onClick={() => setFieldValue('category', 'Terminal')}
    className={`${values.category === 'Terminal' ? classes.activecategory : ''}`}
  >
    <IconWrapperStyle>
      <TerminalIcon width={24} height={24} />
    </IconWrapperStyle>
    <Typography variant="h5" sx={{ opacity: 0.72 }}>
      Terminal
    </Typography>
  </RootStyle>
);

export default TerminalBtn;
