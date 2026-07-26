import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import { ListSubheader } from '@mui/material';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { Skeleton } from '@mui/material'
import { useQuery } from '@tanstack/react-query';
import repoUser from '../repo/repoUser';
import { DefaultErrorPlaceholder } from '../components/DefaultComponents';
import { DrawerContext } from './App'
import Box from '@mui/material/Box';
import repoPortfolio from '../repo/repoPortfolio';

const sx_nested = {
  paddingLeft: 4,
  py: '1px', //Padding of Y-axis => paddingTop + padddingBottom
  borderRadius: 10
}

const sx_nested_6sp = {
  paddingLeft: 6,
  py: 0, //Padding of Y-axis => paddingTop + padddingBottom
  borderRadius: 10
}

function PortfolioDetailListItemText({ title }: { title: string }) {
  return (
    <ListItemText
      disableTypography={true}
      primary={<Typography variant="body2">{title}</Typography>} />
  )
}

interface IPortfolioGroupMenuProps {
  data: { portfolioId: string, portfolioName: string };
}

function PortfolioGroupMenu({ data }: IPortfolioGroupMenuProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <DrawerContext.Consumer>
      {drawerCtt => (
        <div>
          <ListItemButton sx={{ borderRadius: 10 }} onClick={handleClick}>
            {open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            <ListItemText
              sx={{ paddingLeft: 2, my: 0 }}
              disableTypography={true}
              primary={<Typography variant="button">{data.portfolioName}</Typography>}
            />
          </ListItemButton>

          <Collapse in={open} timeout="auto" unmountOnExit>
            <ListItemButton
              onClick={drawerCtt.onMenuItemClick}
              sx={sx_nested_6sp}
              component={Link}
              to={"/portfolio-overview/" + data.portfolioId}
              selected={location.pathname === "/portfolio-overview/" + data.portfolioId}
              color="primary">
              <PortfolioDetailListItemText title="Portfolio Overview" />
            </ListItemButton>

            <ListItemButton
              onClick={drawerCtt.onMenuItemClick}
              sx={sx_nested_6sp}
              component={Link}
              to={"/positions/" + data.portfolioId}
              selected={location.pathname === "/positions/" + data.portfolioId}
              color="primary">
              <PortfolioDetailListItemText title="Positions" />
            </ListItemButton>

            <ListItemButton
              onClick={drawerCtt.onMenuItemClick}
              sx={sx_nested_6sp}
              component={Link}
              to={"/transaction/" + data.portfolioId}
              selected={location.pathname === "/transaction/" + data.portfolioId}
              color="primary">
              <PortfolioDetailListItemText title="Transactions" />
            </ListItemButton>

            <ListItemButton
              onClick={drawerCtt.onMenuItemClick}
              sx={sx_nested_6sp}
              component={Link}
              to={"/dividend/" + data.portfolioId}
              selected={location.pathname === "/dividend/" + data.portfolioId}
              color="primary">
              <PortfolioDetailListItemText title="Dividends" />
            </ListItemButton>
          </Collapse>
        </div>
      )}
    </DrawerContext.Consumer>
  )
}

export function AppDrawer() {
  const { isLoading, isError, data } = useQuery(repoPortfolio.GetSummary());
  const location = useLocation();

  useQuery({
    ...repoUser.Ping(),
    refetchIntervalInBackground: true,
    refetchInterval: 60 * 1000,
  });

  return (
    <DrawerContext.Consumer>
      {drawerCtt => (
        <List dense={true}>
          <ListSubheader disableSticky>
            Overview
          </ListSubheader>

          <ListItemButton
            sx={sx_nested}
            onClick={drawerCtt.onMenuItemClick}
            component={Link}
            to="/"
            selected={location.pathname === "/"}
            color="primary">

            <ListItemText primary="Dashboard" />
          </ListItemButton>

          <ListItemButton
            sx={sx_nested}
            onClick={drawerCtt.onMenuItemClick}
            component={Link}
            to="/portfolio-overview/"
            selected={location.pathname === "/portfolio-overview/"}
            color="primary">
            <ListItemText primary="Portfolios Overview" />
          </ListItemButton>

          <ListItemButton
            sx={sx_nested}
            onClick={drawerCtt.onMenuItemClick}
            component={Link}
            to="/portfolios-details/"
            selected={location.pathname === "/portfolios-details/"}
            color="primary">
            <ListItemText primary="Portfolios Details" />
          </ListItemButton>

          <ListItemButton
            sx={sx_nested}
            onClick={drawerCtt.onMenuItemClick}
            component={Link}
            to="/positions/"
            selected={location.pathname === "/positions/"}
            color="primary">
            <ListItemText primary="Positions" />
          </ListItemButton>

          <ListItemButton
            sx={sx_nested}
            onClick={drawerCtt.onMenuItemClick}
            component={Link}
            to="/transaction/"
            selected={location.pathname === "/transaction/"}
            color="primary">
            <ListItemText primary="Transactions" />
          </ListItemButton>

          <ListItemButton
            sx={sx_nested}
            onClick={drawerCtt.onMenuItemClick}
            component={Link}
            to="/dividend/"
            selected={location.pathname === "/dividend/"}
            color="primary">
            <ListItemText primary="Dividends" />
          </ListItemButton>

          <ListItemButton
            sx={sx_nested}
            onClick={drawerCtt.onMenuItemClick}
            component={Link}
            to="/ticker-overview/"
            selected={location.pathname === "/ticker-overview/"}
            color="primary">
            <ListItemText primary="Ticker Overview" />
          </ListItemButton>

          <Divider />

          <ListSubheader disableSticky>
            Open Portfolios
          </ListSubheader>

          {isLoading &&
            <SkeletonList />
          }

          {isError && !data &&
            <Box sx={{
              height: "200px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}>
              <DefaultErrorPlaceholder />
            </Box>
          }

          {!!data &&
            data.details
              .map(p =>
                <PortfolioGroupMenu key={p.portfolioId} data={p} />
              )}

          <ListSubheader disableSticky>
            Virtual Portfolios
          </ListSubheader>

          {isLoading &&
            <SkeletonList />
          }

          {!!data &&
            data.virtualPortfolioDetails
              .map(p =>
                <PortfolioGroupMenu key={p.portfolioId} data={p} />
              )}

          <ListSubheader disableSticky>
            Closed Portfolios
          </ListSubheader>

          {isLoading &&
            <SkeletonList />
          }

          {!!data &&
            data.closedDetails
              .map(p =>
                <PortfolioGroupMenu key={p.portfolioId} data={p} />
              )}

          <ListSubheader disableSticky>
            Administration
          </ListSubheader>

          <ListItemButton
            sx={sx_nested}
            onClick={drawerCtt.onMenuItemClick}
            component={Link}
            to="/admin"
            selected={location.pathname === "/admin"}
            color="primary">

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
      {[...Array(1).keys()].map((i) =>
        <div key={i}>
          <ListItem>
            <ListItemText>
              <Skeleton width={180} />
            </ListItemText>
          </ListItem>
        </div>
      )}
    </List>
  )
}