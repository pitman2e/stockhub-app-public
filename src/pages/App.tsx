import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { AppDrawer } from './AppDrawer';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Tooltip from '@mui/material/Tooltip';
import { getAuth, User } from 'firebase/auth';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import RefreshIcon from '@mui/icons-material/Refresh';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { Backdrop } from '@mui/material';
import { CircularProgress } from '@mui/material';
import { Login } from './Login';
import '../auth/firebase'; //Initialise firebase
import { RoutedPage, RoutedPageTitle } from '../routes';
import { useSelector, useDispatch } from 'react-redux'
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import { closeMessage } from '../redux/snackbarSlice';
import { selectSnackbarState } from '../redux/snackbarSlice';
import { useColorMode } from '../hooks/useColorMode';
import utils from '../utils/utils';

const drawerWidth = 240;
const queryClient = new QueryClient();
const localStoragePersister = createAsyncStoragePersister({ storage: window.localStorage })

// TanStack DevTools: This code is only for TypeScript
declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__:
      import('@tanstack/query-core').QueryClient
  }
}

// TanStack DevTools: This code is for all users
window.__TANSTACK_QUERY_CLIENT__ = queryClient

interface IDrawerProps {
  onMenuItemClick: () => void
}

export const DrawerContext = React.createContext<IDrawerProps>({ onMenuItemClick: () => { } });

persistQueryClient({
  queryClient: queryClient,
  persister: localStoragePersister,
})

interface IAppProps {
  window?: () => Window;
}

export default function App(props: IAppProps) {
  const isDemoMode = utils.isDemoMode();
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = React.useState(!isDemoMode);
  const [isLogin, setIsLogin] = React.useState(isDemoMode);
  const colorMode = useColorMode();
  const snackbarState = useSelector(selectSnackbarState)
  const dispatch = useDispatch();
  const theme = useTheme();

  const handleSnackbarClose = () => {
    dispatch(closeMessage())
  };

  !isDemoMode && 
  React.useEffect(() => {
    getAuth().onAuthStateChanged(user => updateLoginStatus(user));
  });

  function updateLoginStatus(user: User | null) {
    setIsLoading(false);
    setIsLogin(Boolean(user));
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleClickLogout = () => {
    setIsLogoutDialogOpen(true);
  };

  const handleLogoutClose = () => {
    setIsLogoutDialogOpen(false);
  };

  const handleLogoutCloseAndLogout = () => {
    setIsLogoutDialogOpen(false);
    getAuth().signOut();
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries();
  }

  const container = window !== undefined ? () => window().document.body : undefined;

  if (isLoading) {
    return (
      <Backdrop
        open={true}
        sx={{ backgroundColor: theme.palette.grey["900"] }}
      >
        <CircularProgress sx={{ color: theme.palette.grey["50"] }} />
      </Backdrop>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline enableColorScheme />

        {!isLogin &&
          <Login />
        }

        {isLogin &&
          <>
            <AppBar
              position="fixed"
              sx={{
                width: { md: `calc(100% - ${drawerWidth}px)` },
                ml: { md: `${drawerWidth}px` },
              }}
            >
              <Toolbar>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2, display: { md: 'none' } }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: { md: 'none' } }} >
                    <RoutedPageTitle />
                  </Box>
                </Typography>

                <Tooltip title="Toggle Light/Dark Theme" aria-label="toggle-theme">
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
                  <IconButton
                    color="inherit"
                    onClick={handleRefresh}
                  >
                    <Badge color="secondary">
                      <RefreshIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                {!isDemoMode && 
                <Tooltip title="Logout" aria-label="logout">
                  <IconButton
                    color="inherit"
                    onClick={(event) => {
                      handleClickLogout();
                      event.preventDefault();
                    }}
                  >
                    <Badge color="secondary">
                      <ExitToAppIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>}

              </Toolbar>
            </AppBar>
            <Box
              component="nav"
              sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
              aria-label="drawer"
            >
              {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
              <Drawer
                container={container}
                variant="temporary" //Temporary => Drawer Open => Html body overflow hidden
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                  keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                  display: { xs: 'block', md: 'none' },
                  '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
              >
                <DrawerContext.Provider value={{ onMenuItemClick: handleDrawerToggle }}>
                  <AppDrawer />
                </DrawerContext.Provider>
              </Drawer>
              <Drawer
                variant="permanent"
                sx={{
                  display: { xs: 'none', md: 'block' },
                  '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
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
                  overflowX: "hidden" //Let the children overflow
                },
                height: '100vh',
              }}
            >
              <Toolbar />
              <RoutedPage />

              <Stack spacing={2} sx={{ width: '100%' }}>
                <Snackbar open={snackbarState.isOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                  <Alert elevation={6} variant="filled" onClose={handleSnackbarClose} severity={snackbarState.severity} sx={{ width: '100%' }}>
                    {snackbarState.message}
                  </Alert>
                </Snackbar>
              </Stack>
            </Box>

            <Dialog
              open={isLogoutDialogOpen}
              onClose={handleLogoutClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">{"Confirm to Logout ?"}</DialogTitle>
              {/*
        <DialogContent>
          <DialogContentText id="alert-dialog-description"></DialogContentText>
        </DialogContent>
        */}
              <DialogActions>
                <Button onClick={handleLogoutClose} color="primary">
                  Cancel
                </Button>
                <Button onClick={handleLogoutCloseAndLogout} color="primary" autoFocus>
                  Logout
                </Button>
              </DialogActions>
            </Dialog>
          </>
        }
      </Box>
    </QueryClientProvider>
  );
}