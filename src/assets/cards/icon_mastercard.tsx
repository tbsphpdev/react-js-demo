import { Box, BoxProps } from '@material-ui/core';

// ----------------------------------------------------------------------

export default function MasterCardIcon({ ...other }: BoxProps) {
  return (
    <Box {...other}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="36"
        height="24"
        version="1.1"
        viewBox="0 0 27 18"
      >
        <g transform="translate(-17.915 -18)">
          <path fill="none" d="M0 0H152.407V108H0z" />
          <g strokeWidth="0.241">
            <path fill="#ff5f00" d="M27.765 19.924H35.066V34.076H27.765z" />
            <path
              fill="#eb001b"
              d="M28.228 27a8.33 8.984 0 013.187-7.076 8.344 9 0 100 14.152A8.33 8.985 0 0128.228 27z"
            />
            <path
              fill="#f79e1b"
              d="M44.915 27a8.344 9 0 01-13.5 7.076 8.345 9.001 0 000-14.152A8.344 9 0 0144.915 27z"
            />
            <path
              fill="#f79e1b"
              d="M44.119 32.577v-.29h.108v-.059h-.276v.06h.109v.289zm.535 0v-.35h-.084l-.097.24-.098-.24h-.084v.35h.06v-.264l.09.228h.062l.092-.228v.264z"
            />
          </g>
        </g>
      </svg>
    </Box>
  );
}
