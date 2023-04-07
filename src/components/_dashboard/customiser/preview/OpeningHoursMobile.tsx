import { OpeningHourProps } from '@customTypes/blinkPages';
import { Typography, Stack, Chip, ListItemText, MenuItem, MenuList } from '@material-ui/core';

import { Mail, Phone } from '@material-ui/icons';
import { capitalCase } from 'change-case';

const OpeningHoursMobile = ({ contact, data }: OpeningHourProps) => (
  <>
    <MenuList>
      {Object.entries(data).map(([key, value]) => {
        const { close, isClosed, open } = value;

        const { hour: Ohour, minute: Ominute, type: Otype } = open;
        const { hour: Chour, minute: Cminute, type: Ctype } = close;

        return (
          <MenuItem key={`opening-${key}`}>
            <ListItemText
              primaryTypographyProps={{
                color: 'textSecondary',
                variant: 'subtitle2'
              }}
            >
              {capitalCase(key)}
            </ListItemText>
            {isClosed ? (
              <Typography variant="caption" color="textSecondary">
                Closed
              </Typography>
            ) : (
              <>
                <Typography variant="caption" color="textSecondary">
                  {`${Ohour}:${Ominute} ${Otype}`} - {`${Chour}:${Cminute} ${Ctype}`}
                </Typography>
              </>
            )}
          </MenuItem>
        );
      })}
    </MenuList>

    <Stack justifyContent="center" alignItems="center" spacing={2} marginTop={1} padding={1}>
      {contact.email && <Chip label={contact.email} icon={<Mail fontSize="small" />} />}

      {contact.phone && <Chip label={contact.phone} icon={<Phone fontSize="small" />} />}
    </Stack>
  </>
);

export default OpeningHoursMobile;
