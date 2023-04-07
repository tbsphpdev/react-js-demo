import {
  Box,
  Step,
  StepLabel,
  Stepper,
  stepConnectorClasses,
  StepConnector,
  StepIconProps,
  Stack,
  Typography
} from '@material-ui/core';
import { experimentalStyled as styled } from '@material-ui/core/styles';
import { fDateTimeSuffix } from 'utils/formatTime';

type EventType = {
  created: string | null;
  opened: string | null;
  paid: string | null;
  cancelled: string | null;
};

type PaylinkTImelineProps = {
  history: EventType;
};

const QontoConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: 'calc(-50% + 16px)',
    right: 'calc(50% + 16px)'
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.success.main
    }
  },
  [`&.${stepConnectorClasses.disabled}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.error.main
    }
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[400] : '#eaeaf0',
    borderTopWidth: 3,
    borderRadius: 1
  }
}));

const QontoStepIconRoot = styled('div')<{ ownerState: { active?: boolean } }>(
  ({ theme, ownerState }) => ({
    color: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#eaeaf0',
    display: 'flex',
    height: 22,
    alignItems: 'center',
    ...(ownerState.active && {
      color: '#784af4'
    }),
    '& .QontoStepIcon-completedIcon': {
      width: 10,
      height: 10,
      backgroundColor: theme.palette.success.main,
      borderRadius: '50%',
      zIndex: 1
    },
    '& .QontoStepIcon-error': {
      width: 10,
      height: 10,
      backgroundColor: theme.palette.error.main,
      borderRadius: '50%',
      zIndex: 1
    },
    '& .QontoStepIcon-circle': {
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: 'currentColor'
    }
  })
);

function QontoStepIcon(props: StepIconProps) {
  const { active, completed, className, error } = props;

  return (
    <QontoStepIconRoot ownerState={{ active }} className={className}>
      {error && <div className="QontoStepIcon-error" />}
      {completed && !error && <div className="QontoStepIcon-completedIcon" />}
      {!completed && !error && <div className="QontoStepIcon-circle" />}
    </QontoStepIconRoot>
  );
}

const steps = ['created', 'opened', 'paid', 'cancelled'];

export default function PaylinkTimeline({ history }: PaylinkTImelineProps) {
  return (
    <Box sx={{ width: '100%' }}>
      <Stepper connector={<QontoConnector />} alternativeLabel>
        {steps.map((label, index) => {
          const event = history[label as keyof EventType];
          const isCancelled = !!history.cancelled;
          const labelProps: {
            optional?: React.ReactNode;
            error?: boolean;
          } = {};

          if (isCancelled) {
            if (label === 'cancelled') {
              labelProps.error = true;
            }
            return (
              event && (
                <Step key={label} completed={!!event} disabled={label === 'cancelled'}>
                  <StepLabel StepIconComponent={QontoStepIcon} {...labelProps}>
                    <Stack>
                      <Typography
                        sx={{
                          textTransform: 'capitalize'
                        }}
                      >
                        {label}
                      </Typography>
                      <Typography color="textSecondary" fontSize="small">
                        {event ? fDateTimeSuffix(event) : ''}
                      </Typography>
                    </Stack>
                  </StepLabel>
                </Step>
              )
            );
          }
          return (
            label !== 'cancelled' && (
              <Step key={label} completed={!!event} disabled={false}>
                <StepLabel StepIconComponent={QontoStepIcon}>
                  <Stack>
                    <Typography
                      sx={{
                        textTransform: 'capitalize'
                      }}
                    >
                      {label}
                    </Typography>
                    <Typography color="textSecondary" fontSize="small">
                      {event ? fDateTimeSuffix(event) : ''}
                    </Typography>
                  </Stack>
                </StepLabel>
              </Step>
            )
          );
        })}
      </Stepper>
    </Box>
  );
}
