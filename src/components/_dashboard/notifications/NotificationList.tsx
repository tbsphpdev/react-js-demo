import {
  Pagination,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tabs
} from '@material-ui/core';
import { camelCase, capitalCase } from 'change-case';
import Scrollbar from 'components/Scrollbar';
import useAuth from 'hooks/useAuth';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { getNotifications } from 'redux/slices/notification';
import { dispatch, RootState, useSelector } from 'redux/store';
import NotificationListHead from './NotificationListHead';
import NotificationListRow from './NotificationListRow';

const NOTIFICATION_TABS = ['all', 'VT', 'blinkPage', 'paylink', 'directDebit'];

const NOTIFICATION_HEAD = [
  'Notification Type',
  'Date/Time',
  'Customer Name',
  'Amount',
  'Reference'
];

const NotificationList = () => {
  const [currentTab, setCurrentTab] = useState('all');
  const [page, setPage] = useState<number>(1);

  const location = useLocation();
  const state = location.state as { type?: string };

  const { user } = useAuth();

  const { notifications, total } = useSelector((state: RootState) => state.notification);

  useEffect(() => {
    if (
      state.type &&
      NOTIFICATION_TABS.map((n) => n.toLowerCase()).includes(state?.type.toLowerCase())
    ) {
      setCurrentTab(state.type);
    }
  }, [state?.type]);

  useEffect(() => {
    const limit = 10;
    const offset = limit * (page - 1);
    const type = currentTab === 'all' ? null : currentTab;
    dispatch(getNotifications(user?.userSub, limit, offset, type));
  }, [currentTab, page, user?.userSub]);

  const filteredNotifications =
    currentTab === 'all'
      ? notifications
      : notifications.filter(
          (n) => n.notifType.toLowerCase() === camelCase(currentTab).toLowerCase()
        );

  const handleTab = (val: string) => {
    setCurrentTab(val);
    handlePage(1);
  };

  const handlePage = (page: number): void => {
    setPage(page);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3
      }}
    >
      <Stack spacing={3}>
        <Tabs
          value={currentTab}
          scrollButtons="auto"
          variant="scrollable"
          allowScrollButtonsMobile
          onChange={(e, value) => handleTab(value)}
        >
          {NOTIFICATION_TABS.map((tab) => (
            <Tab
              disableRipple
              key={tab}
              label={tab === 'VT' ? 'VT' : capitalCase(tab)}
              value={tab}
            />
          ))}
        </Tabs>

        <Scrollbar>
          <TableContainer>
            <Table>
              <NotificationListHead headLabel={NOTIFICATION_HEAD} />
              <TableBody>
                {filteredNotifications.map((n) => (
                  <NotificationListRow key={n.id} notification={n} />
                ))}
                {filteredNotifications.length === 0 && (
                  <TableRow>
                    <TableCell>No notifications...</TableCell>
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
        {filteredNotifications.length > 0 && (
          <Pagination
            count={Math.ceil(total / 10)}
            page={page}
            onChange={(e, page) => handlePage(page)}
          />
        )}
      </Stack>
    </Paper>
  );
};

export default NotificationList;
