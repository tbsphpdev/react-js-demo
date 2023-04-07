import creditCardFilled from '@iconify/icons-ant-design/credit-card-filled';
import { Icon } from '@iconify/react';
import { Card, Typography } from '@material-ui/core';
import { alpha, experimentalStyled as styled } from '@material-ui/core/styles';
// ----------------------------------------------------------------------

const RootStyle = styled(Card)(({ theme }) => ({
  boxShadow: 'none',
  textAlign: 'center',
  padding: theme.spacing(3, 0),
  color: theme.palette.primary.darker,
  backgroundColor: '#ffdba67a',
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
  color: '#f0a12b',
  backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0)} 0%, ${alpha(
    theme.palette.primary.dark,
    0.24
  )} 100%)`
}));

const Gateway = ({ setFieldValue, values, classes }: any) => (
  <RootStyle
    onClick={() => setFieldValue('category', 'Gateway')}
    className={`${values.category === 'Gateway' ? classes.activecategory : ''}`}
  >
    <IconWrapperStyle>
      <Icon icon={creditCardFilled} width={24} height={24} />
    </IconWrapperStyle>
    <Typography variant="h5" sx={{ opacity: 0.72 }}>
      Gateway
    </Typography>
  </RootStyle>
);

export default Gateway;
