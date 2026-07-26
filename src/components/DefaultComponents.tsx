import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import Accordion from '@mui/material/Accordion';
import ErrorIcon from '@mui/icons-material/Error';
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import { Box } from '@mui/system';
import React from 'react';

export function DefaultPaper({ children }: { children: React.ReactNode }) {
    return (
        <Paper
            sx={{
                padding: 2
            }}>
            {children}
        </Paper>
    );
}

export function DefaultHeader({ title }: { title: string }) {
    return (
        <Container
            maxWidth={false}
            disableGutters
            sx={(_theme) => ({
                display: { xs: 'none', md: 'block' },
            })}>
            <Typography variant="h4" gutterBottom={true}>
                {title}
            </Typography>
        </Container>
    );
}

export function DefaultContainer({ children }: { children: React.ReactNode }) {
    return (
        <Container
            maxWidth={false}
            sx={(theme) => ({
                [theme.breakpoints.down("md")]: {
                    paddingLeft: 0,
                    paddingRight: 0,
                }
            })}>
            {children}
        </Container>
    );
}

export function DefaultAccordion({ children }: { children: NonNullable<React.ReactNode> }) {
    return (
        <Accordion>
            {children}
        </Accordion>
    );
}

export function DefaultErrorPlaceholder({ errorMsg }: { errorMsg?: string }) {
    return (
        <Box sx={{ textAlign: 'center' }}>
            <ErrorIcon fontSize="large" />
            {!!errorMsg &&
                <Typography>
                    {errorMsg}
                </Typography>
            }
        </Box>
    )
}

export function DefaultLinearProgress(props: LinearProgressProps) {
    return <LinearProgress
        {...props}
        sx={{
            position: "relative",
            borderRadius: "3px",
            marginBottom: "-4px",
        }}
    />
}