import { Box, BoxProps } from '@material-ui/core';

// ----------------------------------------------------------------------

export default function VisaIcon({ ...other }: BoxProps) {
  return (
    <Box {...other}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="36"
        height="24"
        version="1.1"
        viewBox="0 0 36 24"
      >
        <g fill="none">
          <rect width="36" height="24" x="0" y="0" fill="#fff" rx="4" />
          <path
            fill="#2a2a6c"
            d="M14.7.16l-2 9.25h-2.4l2-9.25zm10.06 6l1.26-3.47.73 3.47zm2.67 3.28h2.22L27.71.19h-2a1.09 1.09 0 00-1 .68l-3.59 8.57h2.52l.49-1.38h3.01zm-6.24-3c.01-2.49-3.35-2.67-3.35-3.67 0-.33.32-.68 1-.77a4.48 4.48 0 012.36.41l.42-2A6.44 6.44 0 0019.38 0c-2.36 0-4 1.26-4 3.06 0 1.33 1.19 2.07 2.09 2.51.9.44 1.25.75 1.24 1.15 0 .62-.74.9-1.43.91a5 5 0 01-2.44-.6l-.43 2a7.16 7.16 0 002.66.49c2.51 0 4.16-1.24 4.17-3.16M11.33.13L7.45 9.38H4.84L2.93 1.99a1 1 0 00-.57-.81A9.89 9.89 0 000 .4L.06.13h4.07a1.12 1.12 0 011.11.94l1 5.35L8.73.13z"
            transform="translate(3 8)"
          />
        </g>
      </svg>
    </Box>
  );
}
