import { Icon } from '@iconify/react';
import { useCallback } from 'react';
import editOutline from '@iconify/icons-eva/edit-outline';

// material
import { Button } from '@material-ui/core';
import { useDispatch, RootState, useSelector } from 'redux/store';
import { openingHoursState, setSelectedBlinkPage } from 'redux/slices/customiser';
import { useNavigate } from 'react-router';
import { PATH_DASHBOARD } from 'routes/paths';

// ----------------------------------------------------------------------

type BlinkP_MM_Props = {
  id: string;
};

export default function BlinkPMoreMenu({ id }: BlinkP_MM_Props) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { blinkPagesList } = useSelector((state: RootState) => state.customiser);

  const handlePageSelection = useCallback(
    (val: string) => {
      if (val) {
        const page = blinkPagesList.find((v) => v.id === val);

        if (page) {
          const { openingHours, defaultCurrency, blinkPageCurrency } = page;
          const updatedData = openingHours || openingHoursState;
          const previewCurrency = blinkPageCurrency.filter((b) => b.id === Number(defaultCurrency));
          dispatch(
            setSelectedBlinkPage({
              ...page,
              openingHours: updatedData,
              previewCurrency: previewCurrency.length > 0 ? previewCurrency[0].symbol : null
            })
          );
          navigate(PATH_DASHBOARD.blinkPages.customiser);
        }
      }
    },
    [blinkPagesList, dispatch, navigate]
  );

  const handleEdit = useCallback(() => {
    handlePageSelection(id);
  }, [handlePageSelection, id]);

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleEdit}
        endIcon={<Icon icon={editOutline} width={24} height={24} />}
        color="info"
      >
        Edit
      </Button>
    </>
  );
}
