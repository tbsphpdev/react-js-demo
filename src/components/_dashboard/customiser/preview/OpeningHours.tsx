import { BlinkContact, OpeningHoursParent } from '@customTypes/blinkPages';
import { CardHeader, CardContent, Card, Stack, Typography } from '@material-ui/core';
import { AccessTimeOutlined } from '@material-ui/icons';
import { MHidden } from 'components/@material-extend';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { openingHoursState } from 'redux/slices/customiser';
import { RootState } from 'redux/store';
import OpeningHoursDesktop from './OpeningHoursDesktop';
import OpeningHoursMobile from './OpeningHoursMobile';

const Title = () => (
  <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
    <AccessTimeOutlined color="secondary" />
    <Typography variant="subtitle2">Opening Hours</Typography>
  </Stack>
);

type PropTypes = {
  isPublic?: boolean;
  publicData?: OpeningHoursParent;
};

const { contact: defaultContact, ...defaultState } = openingHoursState;
const OpeningHours = ({ isPublic = false, publicData = openingHoursState }: PropTypes) => {
  const [data, setData] = useState<Omit<OpeningHoursParent, 'contact'>>({ ...defaultState });
  const [contact, setContact] = useState<BlinkContact>(defaultContact);
  const { openingHours } = useSelector((state: RootState) => state.customiser);

  useEffect(() => {
    if (isPublic) {
      const { contact: pContact, ...rest } = publicData;
      setData(rest);
      setContact(pContact);
    } else {
      const { contact: oContact, ...rest } = openingHours;
      setData(rest);
      setContact(oContact);
    }
  }, [isPublic, openingHours, publicData]);

  const hide = Object.keys(data).every(
    (k) => data[k as keyof Omit<OpeningHoursParent, 'contact'>].isClosed
  );

  if (hide) {
    return null;
  }

  return (
    <>
      <MHidden width="smDown">
        <Card
          sx={{
            px: 1,
            py: 3
          }}
        >
          <CardHeader title={<Title />} />
          <CardContent>
            <OpeningHoursDesktop data={data} contact={contact} />
          </CardContent>
        </Card>
      </MHidden>
      <MHidden width="smUp">
        <Card
          sx={{
            px: 1,
            py: 3
          }}
        >
          <CardHeader title={<Title />} />
          <CardContent
            sx={{
              px: 0.5
            }}
          >
            <OpeningHoursMobile data={data} contact={contact} />
          </CardContent>
        </Card>
      </MHidden>
    </>
  );
};

export default OpeningHours;
