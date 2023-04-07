import { FiltersType } from '@customTypes/report';
import { Box, Checkbox, FormControlLabel, Paper, Stack, Typography } from '@material-ui/core';
import { experimentalStyled as styled, Theme, useTheme } from '@material-ui/core/styles';
import { capitalCaseTransform } from 'change-case';
import { setFilters } from 'redux/slices/reports';
import { dispatch, RootState, useSelector } from 'redux/store';

type FilterBoxesProps = {
  title: string;
  options: any[];
  storeKey: keyof FiltersType;
};

const PaperStyle = styled(Paper)(({ theme, length }: { length: number; theme: Theme }) => ({
  width: theme.spacing(22 * Math.ceil(length / 5)),
  paddingBottom: theme.spacing(4)
}));

const FiltersWrapperStyle = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  flexDirection: 'column',
  maxHeight: theme.spacing(28),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'row',
    maxHeight: 'none',
    justifyContent: 'space-between'
  }
}));

const FilterBoxes = ({ options, storeKey, title }: FilterBoxesProps) => {
  const theme = useTheme();
  const state = useSelector((state: RootState) => state.reports);

  const values = [...state[storeKey]];

  const handleChange = (val: any): void => {
    const opt = [...options];
    const filteredOpt: string[] = opt.filter((o) => o !== 'all');
    let data: string[] = [];

    data = values.includes(val) ? values.filter((s) => s !== val) : [...values, val];

    data = filteredOpt.every((d) => data.includes(d))
      ? [...data, 'all']
      : data.filter((d) => d !== 'all');

    dispatch(
      setFilters({
        key: storeKey,
        data
      })
    );
  };

  const handleAllChange = (val: any): void => {
    const data: string[] = values.includes(val) ? [] : [...options];
    dispatch(
      setFilters({
        key: storeKey,
        data
      })
    );
  };

  return (
    <PaperStyle length={options.length} theme={theme}>
      <Stack spacing={2}>
        <Typography variant="subtitle2">{title}</Typography>
        <FiltersWrapperStyle>
          {options.map((opt) => (
            <Box
              key={opt}
              sx={{
                flexBasis: '50%'
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    value={opt}
                    checked={values.includes('all') ? true : values.includes(opt)}
                    onChange={() => (opt === 'all' ? handleAllChange(opt) : handleChange(opt))}
                  />
                }
                key={opt}
                label={capitalCaseTransform(opt)}
              />
            </Box>
          ))}
        </FiltersWrapperStyle>
      </Stack>
    </PaperStyle>
  );
};

export default FilterBoxes;
