import { useState } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { ListItemButton, Skeleton } from '@mui/material';
import Paper from '@mui/material/Paper';
import Collapse from '@mui/material/Collapse';
import ListItemText from '@mui/material/ListItemText';
import { useQuery } from '@tanstack/react-query';
import { DefaultErrorPlaceholder, DefaultLinearProgress, DefaultPaper } from '../../components/DefaultComponents';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ImminentErrorIcon from '../../components/ImminentErrorIcon';
import PortfolioListSummaryDetail from './PortfolioListSummaryDetail'
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup, { ToggleButtonGroupProps } from '@mui/material/ToggleButtonGroup';
import { Theme } from "@mui/material/styles";
import repoPortfolio from '../../repo/repoPortfolio';

const sxGridItem = (theme: Theme) => ({
    "&:hover": {
        backgroundColor: theme.gridItemHover.color,
    }
})

export default function PortfolioListSummary() {
    const lsIsSumDetailExpanded = localStorage.getItem("homeIsSumDetailExpanded") === "Y";
    const [closedPosOpen, setClosedPosOpen] = useState(false);
    const [detailPosOpen, setDetailPosOpen] = useState(lsIsSumDetailExpanded);
    const lsIsLatest = localStorage.getItem("homeIslatest") === "Y";
    const [isLatest, setIsLatest] = useState(lsIsLatest);
    const lsDefaultCurrency = localStorage.getItem("homeDefaultCurrency") === null ? "" : localStorage.getItem("homeDefaultCurrency");
    const [defaultCurrency, setHomeDefaultCurrency] = useState(lsDefaultCurrency);

    const handleCurrencyChange: ToggleButtonGroupProps['onChange'] = (_event, newValue) => {
        const cur = newValue || "";
        localStorage.setItem("homeDefaultCurrency", cur);
        setHomeDefaultCurrency(cur);
    }

    const handleClosedPosClick = () => {
        setClosedPosOpen(!closedPosOpen);
    };

    const handleDetailPosClick = () => {
        setDetailPosOpen(!detailPosOpen);
        localStorage.setItem("homeIsSumDetailExpanded", !detailPosOpen ? "Y" : "N");
    };

    const onLatestChanged = () => {
        const prevIsLatest = isLatest;
        setIsLatest(!prevIsLatest);
        localStorage.setItem("homeIslatest", !prevIsLatest ? "Y" : "N");
    }

    const { isLoading, isError, data, isFetching } =
        useQuery(
            {
                ...repoPortfolio.GetSummary({ currency: defaultCurrency }),
                refetchInterval: 60000,
                refetchIntervalInBackground: true,
            }
        );

    if (isError && data === undefined) {
        return (
            <DefaultPaper>
                <DefaultErrorPlaceholder />
            </DefaultPaper>
        )
    }

    return (
        <>
            {isFetching && <DefaultLinearProgress />}
            <Paper>
                <Grid container sx={{
                    paddingTop: 2,
                    paddingLeft: 2,
                    paddingRight: 2,
                }}>
                    <Grid container size={{ xs: 12 }}>
                        <Grid size="grow">
                            <Typography variant="h6">
                                Portfolio {isError && <ImminentErrorIcon />}
                            </Typography>
                        </Grid>

                        <Grid container sx={{ paddingBottom: 2 }} spacing={1}>
                            <Grid>
                                <ToggleButton
                                    color="primary"
                                    value="check"
                                    selected={isLatest}
                                    onChange={onLatestChanged}
                                    aria-label="Show Latest Change"
                                >
                                    Latest
                                </ToggleButton>
                            </Grid>

                            <Grid>
                                <ToggleButtonGroup
                                    color="primary"
                                    value={defaultCurrency}
                                    exclusive
                                    onChange={handleCurrencyChange}
                                    aria-label="Display Currnecy"
                                >
                                    <ToggleButton value="HKD">HKD</ToggleButton>
                                    <ToggleButton value="USD">USD</ToggleButton>
                                </ToggleButtonGroup>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid size={{ xs: 3, sm: 6 }} sx={{ textAlign: 'right' }}>
                    </Grid>

                    <Grid container size={{ xs: 3, sm: 2 }} sx={{ textAlign: "right", flexDirection: "column" }}>
                        <Typography variant="caption">Mkt/Unr.Cost</Typography>
                    </Grid>

                    <Grid container size={{ xs: 3, sm: 2 }} sx={{ textAlign: 'right', flexDirection: "column" }}>
                        <Typography variant="caption">Daily/%</Typography>
                    </Grid>

                    <Grid container size={{ xs: 3, sm: 2 }} sx={{ textAlign: 'right', flexDirection: "column" }}>
                        <Typography variant="caption">P&L/%</Typography>
                    </Grid>
                </Grid>

                <Grid container>
                    <Grid size={{ xs: 12 }}>
                        <List component="nav">
                            {isLoading &&
                                <ListItem>
                                    <Grid size={{ xs: 12 }} >
                                        <Skeleton />
                                        <Skeleton />
                                        <Skeleton />
                                    </Grid>
                                </ListItem>
                            }

                            {!isLoading && data !== undefined && data.summary !== null &&
                                (
                                    <ListItem divider sx={sxGridItem}>
                                        <PortfolioListSummaryDetail data={[data.summary]} isLatest={isLatest} />
                                    </ListItem>
                                )}

                            {!isLoading && data !== undefined &&
                                data.virtualPortfolioDetails.map((d, idx) => {
                                    return (
                                        <ListItem divider={idx === data.virtualPortfolioDetails.length - 1} key={d.portfolioId} sx={sxGridItem}>
                                            <PortfolioListSummaryDetail data={[d]} isLatest={isLatest} />
                                        </ListItem>
                                    )
                                })
                            }


                            <ListItemButton onClick={handleDetailPosClick}>
                                <ListItemText primary={"Detail Portfolios"} />
                                {detailPosOpen ? <ExpandLess /> : <ExpandMore />}
                            </ListItemButton>

                            <Collapse in={detailPosOpen} timeout="auto" unmountOnExit>
                                {!isLoading && data !== undefined &&
                                    data.details.map(d => {
                                        return (
                                            <ListItem key={d.portfolioId} sx={sxGridItem}>
                                                <PortfolioListSummaryDetail data={[d]} isLatest={isLatest} />
                                            </ListItem>
                                        )
                                    })
                                }
                            </Collapse>

                            <ListItemButton onClick={handleClosedPosClick}>
                                <ListItemText primary={"Closed Portfolio"} />
                                {closedPosOpen ? <ExpandLess /> : <ExpandMore />}
                            </ListItemButton>

                            <Collapse in={closedPosOpen} timeout="auto" unmountOnExit>
                                {!isLoading && data !== undefined &&
                                    data.closedDetails.map(d => {
                                        return (
                                            <ListItem key={d.portfolioId} sx={sxGridItem}>
                                                <PortfolioListSummaryDetail data={[d]} isLatest={isLatest} />
                                            </ListItem>
                                        )
                                    })
                                }
                            </Collapse>
                        </List>
                    </Grid>
                </Grid>
            </Paper >
        </>
    )
}