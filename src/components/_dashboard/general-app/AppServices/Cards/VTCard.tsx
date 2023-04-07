import { useNavigate } from 'react-router-dom';

// material
import { alpha, experimentalStyled as styled } from '@material-ui/core/styles';
import { Card, Typography } from '@material-ui/core';
import { PATH_DASHBOARD } from 'routes/paths';

// ----------------------------------------------------------------------

type PropTypes = {
  icon: JSX.Element;
};

const RootStyle = styled(Card)(({ theme }) => ({
  boxShadow: 'none',
  textAlign: 'center',
  padding: theme.spacing(3, 0),
  color: theme.palette.primary.darker,
  backgroundColor: theme.palette.primary.lighter,
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

// ----------------------------------------------------------------------

const VTCard = ({ icon }: PropTypes) => {
  const navigate = useNavigate();

  return (
    <RootStyle onClick={() => navigate(`${PATH_DASHBOARD.virtualTerminal.create}`)}>
      <IconWrapperStyle>{icon}</IconWrapperStyle>
      <Typography variant="h5" sx={{ opacity: 0.72 }}>
        Take A Payment
      </Typography>
    </RootStyle>
  );
};

export default VTCard;
