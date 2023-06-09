import { Box, BoxProps } from '@material-ui/core';

// ----------------------------------------------------------------------

export default function DinersClubIcon({ ...other }: BoxProps) {
  return (
    <Box {...other}>
      <svg xmlns="http://www.w3.org/2000/svg" width="25pt" height="20pt" viewBox="12 4 20 20">
        <g>
          <path
            fill="#0079BE"
            d="M33.805 14.54c0-5.75-4.676-9.724-9.801-9.72h-4.406c-5.184-.004-9.453 3.973-9.453 9.72 0 5.253 4.27 9.573 9.453 9.55h4.406c5.125.023 9.8-4.297 9.8-9.55zm0 0"
          />
          <path
            fill="#FFF"
            d="M19.625 5.633c-4.738.004-8.574 3.949-8.578 8.82.004 4.871 3.84 8.82 8.578 8.82 4.738 0 8.578-3.949 8.578-8.82s-3.84-8.816-8.578-8.82zm0 0"
          />
          <path
            fill="#0079BE"
            d="M14.203 14.43c.004-2.38 1.45-4.41 3.488-5.22v10.438c-2.039-.808-3.484-2.835-3.488-5.218zm7.383 5.218V9.211c2.039.805 3.488 2.84 3.492 5.219-.004 2.383-1.453 4.414-3.492 5.218zm0 0"
          />
        </g>
      </svg>
    </Box>
  );
}
