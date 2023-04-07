// material
import { alpha, experimentalStyled as styled } from '@material-ui/core/styles';
import { Card, Typography } from '@material-ui/core';
import { useNavigate } from 'react-router';
import { PATH_DASHBOARD } from 'routes/paths';

// ----------------------------------------------------------------------
type PropTypes = {
  icon: JSX.Element;
};

const RootStyle = styled(Card)(({ theme }) => ({
  boxShadow: 'none',
  textAlign: 'center',
  padding: theme.spacing(3, 0),
  color: theme.palette.warning.darker,
  backgroundColor: theme.palette.warning.lighter,
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
  color: theme.palette.warning.dark,
  backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.warning.dark, 0)} 0%, ${alpha(
    theme.palette.warning.dark,
    0.24
  )} 100%)`
}));

// ----------------------------------------------------------------------

const DirectDebitsCard = ({ icon }: PropTypes) => {
  const navigate = useNavigate();
  return (
    <RootStyle onClick={() => navigate(PATH_DASHBOARD.gc.home)}>
      <IconWrapperStyle>{icon}</IconWrapperStyle>
      <Typography variant="h5" sx={{ opacity: 0.72 }}>
        Direct Debits
      </Typography>
    </RootStyle>
  );
};

export default DirectDebitsCard;
