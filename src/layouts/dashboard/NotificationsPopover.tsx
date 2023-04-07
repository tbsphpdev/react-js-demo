import { capitalCase } from 'change-case';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { Icon } from '@iconify/react';
import bellFill from '@iconify/icons-eva/bell-fill';
import doneAllFill from '@iconify/icons-eva/done-all-fill';
// material
import {
  Box,
  List,
  Badge,
  Button,
  Tooltip,
  Divider,
  ListItem,
  Typography,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem
} from '@material-ui/core';
import { useTheme, experimentalStyled as styled } from '@material-ui/core/styles';

// components
import {
  getNotifications,
  markReadNotifications,
  NotificationType,
  readSingleNotification,
  resetUnreadCount
} from 'redux/slices/notification';
import { dispatch, RootState, useSelector } from 'redux/store';
import useAuth from 'hooks/useAuth';
import { fDateAbr, ftimeSuffix } from 'utils/formatTime';
import { PATH_DASHBOARD } from 'routes/paths';
import Label from 'components/Label';
import useInterval from 'hooks/useInterval';
import moreVerticalFill from '@iconify/icons-eva/more-vertical-fill';
import editFill from '@iconify/icons-eva/edit-fill';
import Scrollbar from '../../components/Scrollbar';
import MenuPopover from '../../components/MenuPopover';
import { MIconButton } from '../../components/@material-extend';

// ----------------------------------------------------------------------

const NotificationWrapperStyle = styled(Box)(({ width }: { width: string }) => ({
  width
}));

function NotificationItem({ notification }: { notification: NotificationType }) {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();
  const { user } = useAuth();
  return (
    <ListItem
      button
      disableGutters
      key={notification.id}
      sx={{
        py: 1.5,
        px: 2.5,
        '&:not(:last-of-type)': { mb: '1px' },
        ...(notification.viewStatus && {
          bgcolor: 'action.selected',
          color: theme.palette.grey[600]
        })
      }}
    >
      <Button
        fullWidth
        to={PATH_DASHBOARD.notification.root}
        state={{
          type: notification.notifType
        }}
        onClick={() => dispatch(readSingleNotification(user?.userSub, notification.id))}
        component={RouterLink}
        sx={{
          ...(notification.viewStatus && {
            color: theme.palette.grey[600]
          })
        }}
      >
        <NotificationWrapperStyle width="25%">
          {notification.viewStatus ? (
            <>
              <Typography variant="subtitle2" noWrap={true}>
                {fDateAbr(notification.createdAt)}
              </Typography>
              <Typography variant="subtitle2" noWrap={true}>
                {ftimeSuffix(notification.createdAt)}
              </Typography>
            </>
          ) : (
            <Label variant="filled" color="error">
              NEW
            </Label>
          )}
        </NotificationWrapperStyle>
        <NotificationWrapperStyle width="25%">
          <Typography variant="subtitle2" noWrap={true}>
            {notification.notifType === 'VT' ? 'VT' : capitalCase(notification.notifType)}
          </Typography>
          <Typography variant="subtitle2" noWrap={true}>
            {capitalCase(notification.notifStatus)}
          </Typography>
        </NotificationWrapperStyle>
        <NotificationWrapperStyle width="30%">
          <Typography variant="subtitle2" noWrap={true}>
            {notification.customerName}
          </Typography>
        </NotificationWrapperStyle>
        <NotificationWrapperStyle width="15%">
          <Typography variant="subtitle2" noWrap={true}>
            {notification.currSymbol} {notification.amount}
          </Typography>
        </NotificationWrapperStyle>
      </Button>

      {!notification.viewStatus && (
        <NotificationWrapperStyle width="10%">
          <>
            <IconButton ref={ref} onClick={() => setIsOpen(true)}>
              <Icon icon={moreVerticalFill} width={20} height={20} />
            </IconButton>
            <Menu
              open={isOpen}
              anchorEl={ref.current}
              onClose={() => setIsOpen(false)}
              PaperProps={{
                sx: { width: 200, maxWidth: '100%' }
              }}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem
                sx={{ color: 'text.secondary' }}
                onClick={() => dispatch(readSingleNotification(user?.userSub, notification.id))}
                disabled={notification.viewStatus}
              >
                <ListItemIcon>
                  <Icon icon={editFill} width={24} height={24} />
                </ListItemIcon>
                <ListItemText
                  primary="Mark as Read"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </MenuItem>
            </Menu>
          </>
        </NotificationWrapperStyle>
      )}
    </ListItem>
  );
}

export default function NotificationsPopover() {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const { notifications, unread } = useSelector((state: RootState) => state.notification);

  const { user } = useAuth();

  const popupNotifications = notifications.slice(0, 5);
  useInterval(() => {
    if (user?.userSub) {
      dispatch(getNotifications(user?.userSub, 5, 0));
    }
  }, 300000);

  useEffect(() => {
    if (user?.userSub) {
      dispatch(getNotifications(user?.userSub, 5, 0));
    }
  }, [user?.userSub]);

  const handleMarkAllAsRead = useCallback(() => {
    if (notifications.some((n) => !n.viewStatus)) {
      dispatch(markReadNotifications(user?.userSub));
    }
  }, [notifications, user?.userSub]);

  const resetCount = useCallback(() => {
    dispatch(resetUnreadCount());
    setOpen(false);
  }, []);

  return (
    <>
      <MIconButton
        ref={anchorRef}
        onClick={() => setOpen(true)}
        color={open ? 'primary' : 'default'}
      >
        <Badge badgeContent={unread} color="error">
          <Icon icon={bellFill} width={20} height={20} />
        </Badge>
      </MIconButton>

      <MenuPopover
        open={open}
        onClose={() => setOpen(false)}
        anchorEl={anchorRef.current}
        sx={{ width: 450 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">Notifications</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              You have {unread} unread messages
            </Typography>
          </Box>

          {unread > 0 && (
            <Tooltip title=" Mark all as read">
              <MIconButton color="primary" onClick={handleMarkAllAsRead}>
                <Icon icon={doneAllFill} width={20} height={20} />
              </MIconButton>
            </Tooltip>
          )}
        </Box>

        <Divider />

        <Scrollbar sx={{ height: { xs: 340, sm: 'auto' } }}>
          <List disablePadding>
            {popupNotifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </List>
        </Scrollbar>

        <Divider />

        <Box sx={{ p: 1 }}>
          <Button
            fullWidth
            disableRipple
            component={RouterLink}
            to={PATH_DASHBOARD.notification.root}
            state={{ type: 'all' }}
            onClick={resetCount}
          >
            View All
          </Button>
        </Box>
      </MenuPopover>
    </>
  );
}
