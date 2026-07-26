import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";
import { ListSubheader } from "@mui/material";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { Skeleton } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import repoUser from "../repo/repoUser";
import { DefaultErrorPlaceholder } from "../components/DefaultComponents";
import { DrawerContext } from "./App";
import Box from "@mui/material/Box";
import repoPortfolio from "../repo/repoPortfolio";
import ApiRequestAdapter from "../adapters/apiRequestAdapter";
import {
  ROUTE_PATHS,
  getDividendPath,
  getPortfolioOverviewPath,
  getPositionsPath,
  getTickerOverviewPath,
  getTransactionPath,
  isRouteActive,
} from "../routes";

const sx_nested = {
  paddingLeft: 4,
  py: "1px", //Padding of Y-axis => paddingTop + padddingBottom
  borderRadius: 10,
};

const sx_nested_6sp = {
  paddingLeft: 6,
  py: 0, //Padding of Y-axis => paddingTop + padddingBottom
  borderRadius: 10,
};

function PortfolioDetailListItemText({ title }: { title: string }) {
  return (
    <ListItemText
      disableTypography={true}
      primary={<Typography variant="body2">{title}</Typography>}
    />
  );
}

interface IPortfolioGroupMenuProps {
  data: { portfolioId: string; name: string };
}

function PortfolioGroupMenu({ data }: IPortfolioGroupMenuProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <DrawerContext.Consumer>
      {(drawerCtt) => (
        <div>
          <ListItemButton sx={{ borderRadius: 10 }} onClick={handleClick}>
            {open ? (
              <ExpandLess fontSize="small" />
            ) : (
              <ExpandMore fontSize="small" />
            )}
            <ListItemText
              sx={{ paddingLeft: 2, my: 0 }}
              disableTypography={true}
              primary={
                <Typography variant="button">{data.name}</Typography>
              }
            />
          </ListItemButton>

          <Collapse in={open} timeout="auto" unmountOnExit>
            <ListItemButton
              onClick={drawerCtt.onMenuItemClick}
              sx={sx_nested_6sp}
              component={Link}
              to={getPortfolioOverviewPath(data.portfolioId)}
              selected={isRouteActive(
                location.pathname,
                ROUTE_PATHS.portfolioOverview,
                data.portfolioId,
              )}
              color="primary"
            >
              <PortfolioDetailListItemText title="Portfolio Overview" />
            </ListItemButton>

            <ListItemButton
              onClick={drawerCtt.onMenuItemClick}
              sx={sx_nested_6sp}
              component={Link}
              to={getPositionsPath(data.portfolioId)}
              selected={isRouteActive(
                location.pathname,
                ROUTE_PATHS.positions,
                data.portfolioId,
              )}
              color="primary"
            >
              <PortfolioDetailListItemText title="Positions" />
            </ListItemButton>

            <ListItemButton
              onClick={drawerCtt.onMenuItemClick}
              sx={sx_nested_6sp}
              component={Link}
              to={getTransactionPath(data.portfolioId)}
              selected={isRouteActive(
                location.pathname,
                ROUTE_PATHS.transaction,
                data.portfolioId,
              )}
              color="primary"
            >
              <PortfolioDetailListItemText title="Transactions" />
            </ListItemButton>

            <ListItemButton
              onClick={drawerCtt.onMenuItemClick}
              sx={sx_nested_6sp}
              component={Link}
              to={getDividendPath(data.portfolioId)}
              selected={isRouteActive(
                location.pathname,
                ROUTE_PATHS.dividend,
                data.portfolioId,
              )}
              color="primary"
            >
              <PortfolioDetailListItemText title="Dividends" />
            </ListItemButton>
          </Collapse>
        </div>
      )}
    </DrawerContext.Consumer>
  );
}

export function AppDrawer() {
  const { isLoading, isError, data } = useQuery(
    ApiRequestAdapter.queryOptions(repoPortfolio.GetSummary()),
  );
  const location = useLocation();
  const pingQuery = ApiRequestAdapter.queryOptions(repoUser.Ping());

  useQuery({
    ...pingQuery,
    refetchIntervalInBackground: true,
    refetchInterval: 60 * 1000,
  });

  return (
    <DrawerContext.Consumer>
      {(drawerCtt) => (
        <List dense={true}>
          <ListSubheader disableSticky>Overview</ListSubheader>

          <ListItemButton
            sx={sx_nested}
            onClick={drawerCtt.onMenuItemClick}
            component={Link}
            to={ROUTE_PATHS.home}
            selected={isRouteActive(location.pathname, ROUTE_PATHS.home)}
            color="primary"
          >
            <ListItemText primary="Dashboard" />
          </ListItemButton>

          <ListItemButton
            sx={sx_nested}
            onClick={drawerCtt.onMenuItemClick}
            component={Link}
            to={getPortfolioOverviewPath()}
            selected={isRouteActive(
              location.pathname,
              ROUTE_PATHS.portfolioOverview,
            )}
            color="primary"
          >
            <ListItemText primary="Portfolios Overview" />
          </ListItemButton>

          <ListItemButton
            sx={sx_nested}
            onClick={drawerCtt.onMenuItemClick}
            component={Link}
            to={ROUTE_PATHS.portfoliosDetails}
            selected={isRouteActive(
              location.pathname,
              ROUTE_PATHS.portfoliosDetails,
            )}
            color="primary"
          >
            <ListItemText primary="Portfolios Details" />
          </ListItemButton>

          <ListItemButton
            sx={sx_nested}
            onClick={drawerCtt.onMenuItemClick}
            component={Link}
            to={getPositionsPath()}
            selected={isRouteActive(location.pathname, ROUTE_PATHS.positions)}
            color="primary"
          >
            <ListItemText primary="Positions" />
          </ListItemButton>

          <ListItemButton
            sx={sx_nested}
            onClick={drawerCtt.onMenuItemClick}
            component={Link}
            to={getTransactionPath()}
            selected={isRouteActive(location.pathname, ROUTE_PATHS.transaction)}
            color="primary"
          >
            <ListItemText primary="Transactions" />
          </ListItemButton>

          <ListItemButton
            sx={sx_nested}
            onClick={drawerCtt.onMenuItemClick}
            component={Link}
            to={getDividendPath()}
            selected={isRouteActive(location.pathname, ROUTE_PATHS.dividend)}
            color="primary"
          >
            <ListItemText primary="Dividends" />
          </ListItemButton>

          <ListItemButton
            sx={sx_nested}
            onClick={drawerCtt.onMenuItemClick}
            component={Link}
            to={getTickerOverviewPath()}
            selected={isRouteActive(
              location.pathname,
              ROUTE_PATHS.tickerOverview,
            )}
            color="primary"
          >
            <ListItemText primary="Ticker Overview" />
          </ListItemButton>

          <Divider />

          <ListSubheader disableSticky>Open Portfolios</ListSubheader>

          {isLoading && <SkeletonList />}

          {isError && !data && (
            <Box
              sx={{
                height: "200px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <DefaultErrorPlaceholder />
            </Box>
          )}

          {!!data &&
            data.details.map((p) => (
              <PortfolioGroupMenu key={p.portfolio.portfolioId} data={p.portfolio} />
            ))}

          <ListSubheader disableSticky>Virtual Portfolios</ListSubheader>

          {isLoading && <SkeletonList />}

          {!!data &&
            data.virtualPortfolioDetails.map((p) => (
              <PortfolioGroupMenu key={p.portfolio.portfolioId} data={p.portfolio} />
            ))}

          <ListSubheader disableSticky>Closed Portfolios</ListSubheader>

          {isLoading && <SkeletonList />}

          {!!data &&
            data.closedDetails.map((p) => (
              <PortfolioGroupMenu key={p.portfolio.portfolioId} data={p.portfolio} />
            ))}

          <ListSubheader disableSticky>Administration</ListSubheader>

          <ListItemButton
            sx={sx_nested}
            onClick={drawerCtt.onMenuItemClick}
            component={Link}
            to={ROUTE_PATHS.admin}
            selected={isRouteActive(location.pathname, ROUTE_PATHS.admin)}
            color="primary"
          >
            <ListItemText primary="Data Administration" />
          </ListItemButton>
        </List>
      )}
    </DrawerContext.Consumer>
  );
}

const SkeletonList = () => {
  return (
    <List dense={true}>
      {[...Array(1).keys()].map((i) => (
        <div key={i}>
          <ListItem>
            <ListItemText>
              <Skeleton width={180} />
            </ListItemText>
          </ListItem>
        </div>
      ))}
    </List>
  );
};
