import { experimentalStyled as styled, Typography } from '@material-ui/core';
import { sentenceCase } from 'change-case';
import typography from 'theme/typography';

type PropsType = {
  title: string;
};

const RootLabelStyle = styled(Typography)(({ theme }) => ({
  ...typography.subtitle2,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(1)
}));

const SettingsLabel = ({ title }: PropsType) => (
  <RootLabelStyle>{title === 'URL Slug' ? title : sentenceCase(title)}</RootLabelStyle>
);

export default SettingsLabel;
