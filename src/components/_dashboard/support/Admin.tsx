import { Card, Typography } from '@material-ui/core';
import { alpha, experimentalStyled as styled } from '@material-ui/core/styles';
import AdminIcon from 'assets/icon_accAdmin';
// ----------------------------------------------------------------------

const RootStyle = styled(Card)(({ theme }) => ({
  boxShadow: 'none',
  textAlign: 'center',
  padding: theme.spacing(3, 0),
  color: theme.palette.error.darker,
  backgroundColor: theme.palette.error.lighter,
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
  color: theme.palette.error.dark,
  backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.error.dark, 0)} 0%, ${alpha(
    theme.palette.error.dark,
    0.24
  )} 100%)`
}));

const Admin = ({ setFieldValue, values, classes }: any) => (
  <RootStyle
    onClick={() => setFieldValue('category', 'Account Admin')}
    className={`${values.category === 'Account Admin' ? classes.activecategory : ''}`}
  >
    <IconWrapperStyle>
      <AdminIcon width={24} height={24} />
    </IconWrapperStyle>
    <Typography variant="h5" sx={{ opacity: 0.72 }}>
      Account Admin
    </Typography>
  </RootStyle>
);

export default Admin;
