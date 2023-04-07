import { Menu, MenuItem, ListItemText, Button } from '@material-ui/core';
import { ArrowDropDown } from '@material-ui/icons';
import useToggle from 'hooks/useToggle';
import { useRef } from 'react';

interface PropTypes {
  customerId: string;
  customerName: string;
  openSbscModal: (customerId: string, customerName: string) => void;
  openOopModal: (customerId: string, customerName: string) => void;
}

export default function GCCustomerTableMenu({
  customerId,
  customerName,
  openOopModal,
  openSbscModal
}: PropTypes) {
  const [isOpen, setIsOpen] = useToggle(false);

  const ref = useRef(null);
  return (
    <>
      <Button
        variant="outlined"
        endIcon={<ArrowDropDown />}
        onClick={() => setIsOpen()}
        ref={ref}
        sx={{
          maxWidth: 150
        }}
      >
        Create New
      </Button>
      <Menu
        open={isOpen}
        anchorEl={ref.current}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: {
            width: 200,
            maxWidth: '100%',
            background: (theme) => theme.palette.background.neutral
          },
          elevation: 5
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
      >
        <MenuItem
          sx={{ color: 'text.secondary' }}
          divider
          onClick={() => {
            openSbscModal(customerId, customerName);
            setIsOpen(false);
          }}
        >
          <ListItemText primary="Subscription" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>
        <MenuItem
          sx={{ color: 'text.secondary' }}
          onClick={() => {
            openOopModal(customerId, customerName);
            setIsOpen(false);
          }}
        >
          <ListItemText primary="One-Off payment" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>
      </Menu>
    </>
  );
}
