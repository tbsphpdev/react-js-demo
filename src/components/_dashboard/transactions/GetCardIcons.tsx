import { Stack } from '@material-ui/core';
import {
  AmexIcon,
  DinersClubIcon,
  EloIcon,
  JCBIcon,
  MaestroIcon,
  MasterCardIcon,
  UnionPayIcon,
  VisaIcon,
  DiscoverIcon
} from 'assets';

type PropTypes = {
  name: string | null;
};

const ICONS: any = {
  visa: <VisaIcon />,
  amex: <AmexIcon />,
  'american express': <AmexIcon />,
  mastercard: <MasterCardIcon />,
  jcb: <JCBIcon />,
  dinersclub: <DinersClubIcon />,
  maestro: <MaestroIcon />,
  unionpay: <UnionPayIcon />,
  elo: <EloIcon />,
  discover: <DiscoverIcon />
};

const GetCardIcon = ({ name }: PropTypes) => {
  if (name === null) {
    return null;
  }

  if (ICONS[name]) {
    return (
      <Stack direction="row" alignItems="center">
        {ICONS[name]}
      </Stack>
    );
  }

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {ICONS.mastercard} {ICONS.visa} {ICONS.amex}
    </Stack>
  );
};

export default GetCardIcon;
