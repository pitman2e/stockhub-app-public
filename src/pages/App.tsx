import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import CssBaseline from "@mui/material/CssBaseline";
import Drawer from "@mui/material/Drawer";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { AppDrawer } from "./AppDrawer";
import Tooltip from "@mui/material/Tooltip";
import { getAuth, User } from "firebase/auth";
import ConfirmationDialogWrapper from "../components/ConfirmationDialogWrapper";
import Badge from "@mui/material/Badge";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import RefreshIcon from "@mui/icons-material/Refresh";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { Backdrop } from "@mui/material";
import { CircularProgress } from "@mui/material";
import { Login } from "./Login";
import "../auth/firebase"; //Initialise firebase
import { RoutedPage, RoutedPageTitle } from "../routes";
import { useSelector, useDispatch } from "react-redux";
import Stack from "@mui/material/Stack";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useTheme } from "@mui/material/styles";
import { closeMessage } from "../redux/snackbarSlice";
import { selectSnackbarState } from "../redux/snackbarSlice";
import { useColorMode } from "../hooks/useColorMode";
import { isDemoMode, setToken } from "../utils/apiClient";

const drawerWidth = 240;
const queryClient = new QueryClient();
const localStoragePersister = createAsyncStoragePersister({
  storage: window.localStorage,
});

// TanStack DevTools: This code is only for TypeScript
declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: import("@tanstack/query-core").QueryClient;
  }
}

// TanStack DevTools: This code is for all users
window.__TANSTACK_QUERY_CLIENT__ = queryClient;

interface IDrawerProps {
  onMenuItemClick: () => void;
}

export const DrawerContext = React.createContext<IDrawerProps>({
  onMenuItemClick: () => {},
});

persistQueryClient({
  queryClient: queryClient,
  persister: localStoragePersister,
});

interface IAppProps {
  window?: () => Window;
}

getAuth().onAuthStateChanged(
  async (user) => {
    setToken(await user?.getIdToken())
  }
);

export default function App(props: IAppProps) {
  const isDemo = isDemoMode();
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = React.useState(!isDemo);
  const [isLogin, setIsLogin] = React.useState(isDemo);
  const colorMode = useColorMode();
  const snackbarState = useSelector(selectSnackbarState);
  const dispatch = useDispatch();
  const theme = useTheme();

  const handleSnackbarClose = () => {
    dispatch(closeMessage());
  };

  !isDemo &&
    React.useEffect(() => {
      getAuth().onAuthStateChanged((user) => updateLoginStatus(user));
    });

  function updateLoginStatus(user: User | null) {
    setIsLoading(false);
    setIsLogin(Boolean(user));
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerOpen = () => {
    setMobileOpen(true);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  const handleLogoutConfirm = async () => {
    await getAuth().signOut();
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries();
  };

  const container =
    window !== undefined ? () => window().document.body : undefined;

  if (isLoading) {
    return (
      <Backdrop open={true} sx={{ backgroundColor: theme.palette.grey["900"] }}>
        <CircularProgress sx={{ color: theme.palette.grey["50"] }} />
      </Backdrop>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline enableColorScheme />

        {!isLogin && <Login />}

        {isLogin && (
          <>
            <AppBar
              position="fixed"
              sx={{
                width: { md: `calc(100% - ${drawerWidth}px)` },
                ml: { md: `${drawerWidth}px` },
              }}
            >
              <Toolbar>
                <Tooltip title="Open Drawer" aria-label="Open Drawer">
                  <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{ mr: 2, display: { md: "none" } }}
                  >
                    <MenuIcon />
                  </IconButton>
                </Tooltip>

                <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: { md: "none" } }}>
                    <RoutedPageTitle />
                  </Box>
                </Typography>

                <Tooltip
                  title="Toggle Light/Dark Theme"
                  aria-label="toggle-theme"
                >
                  <IconButton
                    color="inherit"
                    onClick={colorMode.toggleColorMode}
                  >
                    <Badge color="secondary">
                      <Brightness4Icon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                <Tooltip title="Refresh" aria-label="refresh">
                  <IconButton color="inherit" onClick={handleRefresh}>
                    <Badge color="secondary">
                      <RefreshIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                {!isDemo && (
                  <ConfirmationDialogWrapper
                    WrappingComponent={(props) => (
                      <Tooltip title="Logout" aria-label="logout">
                        <IconButton
                          color="inherit"
                          onClick={props.onClick}
                          aria-label="logout"
                        >
                          <Badge color="secondary">
                            <ExitToAppIcon />
                          </Badge>
                        </IconButton>
                      </Tooltip>
                    )}
                    title="Confirm to Logout"
                    description="Are you sure you want to log out?"
                    onDialogConfirm={handleLogoutConfirm}
                  />
                )}
              </Toolbar>
            </AppBar>
            <Box
              component="nav"
              sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
              aria-label="drawer"
            >
              {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
              <SwipeableDrawer
                container={container}
                variant="temporary" //Temporary => Drawer Open => Html body overflow hidden
                open={mobileOpen}
                onOpen={handleDrawerOpen}
                onClose={handleDrawerClose}
                disableSwipeToOpen={false}
                ModalProps={{
                  keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                  display: { xs: "block", md: "none" },
                  "& .MuiDrawer-paper": {
                    boxSizing: "border-box",
                    width: drawerWidth,
                  },
                }}
              >
                <DrawerContext.Provider
                  value={{ onMenuItemClick: handleDrawerClose }}
                >
                  <AppDrawer />
                </DrawerContext.Provider>
              </SwipeableDrawer>
              <Drawer
                variant="permanent"
                sx={{
                  display: { xs: "none", md: "block" },
                  "& .MuiDrawer-paper": {
                    boxSizing: "border-box",
                    width: drawerWidth,
                  },
                }}
                open
              >
                <AppDrawer />
              </Drawer>
            </Box>
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                paddingTop: 1,
                paddingBottom: 1,
                width: {
                  md: `calc(100% - ${drawerWidth}px)`,
                  overflowX: "hidden", //Let the children overflow
                },
                height: "100vh",
              }}
            >
              <Toolbar />
              <RoutedPage />

              <Stack spacing={2} sx={{ width: "100%" }}>
                <Snackbar
                  open={snackbarState.isOpen}
                  autoHideDuration={6000}
                  onClose={handleSnackbarClose}
                >
                  <Alert
                    elevation={6}
                    variant="filled"
                    onClose={handleSnackbarClose}
                    severity={snackbarState.severity}
                    sx={{ width: "100%" }}
                  >
                    {snackbarState.message}
                  </Alert>
                </Snackbar>
              </Stack>
            </Box>

          </>
        )}
      </Box>
    </QueryClientProvider>
  );
}
