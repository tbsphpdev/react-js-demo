import roundSupport from '@iconify/icons-ic/round-support';
import { Icon } from '@iconify/react';
import { Card, Typography } from '@material-ui/core';
import { alpha, experimentalStyled as styled } from '@material-ui/core/styles';
// ----------------------------------------------------------------------

const RootStyle = styled(Card)(({ theme }) => ({
  boxShadow: 'none',
  textAlign: 'center',
  padding: theme.spacing(3, 0),
  color: theme.palette.primary.darker,
  backgroundColor: '#ceb8f6b0',
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
  color: '#6000b7',
  backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0)} 0%, ${alpha(
    theme.palette.primary.dark,
    0.24
  )} 100%)`
}));

const Query = ({ setFieldValue, values, classes }: any) => (
  <RootStyle
    onClick={() => setFieldValue('category', 'General Query')}
    className={`${values.category === 'General Query' ? classes.activecategory : ''}`}
  >
    <IconWrapperStyle>
      <Icon icon={roundSupport} width={24} height={24} />
    </IconWrapperStyle>
    <Typography variant="h5" sx={{ opacity: 0.72 }}>
      General Query
    </Typography>
  </RootStyle>
);

export default Query;
