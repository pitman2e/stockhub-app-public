import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Box } from '@mui/material';
import { Grid } from '@mui/material';

export function Login() {
  const [loginErrMsg, setLoginErrMsg] = useState("")

  return (
    <Container component="main">
      <Box
        component='div'
        sx={{
          paddingTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }} >
        <Avatar sx={(theme) => ({
          margin: 1,
          backgroundColor: theme.palette.secondary.main,
        })}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>

        <form>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12 }}>
              <TextField
                id="email"
                label="Email"
                variant="standard"
                error={Boolean(loginErrMsg)}
                fullWidth
                onChange={() => setLoginErrMsg("")}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                id="password"
                type="password"
                label="Password"
                variant="standard"
                error={Boolean(loginErrMsg)}
                helperText={loginErrMsg}
                fullWidth
                onChange={() => setLoginErrMsg("")}
              />
            </Grid>

            <Grid></Grid>

            <Grid size={{ xs: 12 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                sx={{
                }}
                onClick={() => {
                  const auth = getAuth();
                  const emailInput = document.getElementById("email") as HTMLInputElement | null;
                  const passwordInput = document.getElementById("password") as HTMLInputElement | null;

                  if (emailInput && passwordInput) {
                    const email = emailInput.value;
                    const password = passwordInput.value;

                    signInWithEmailAndPassword(auth, email, password)
                      .then((_userCredential) => {
                        //console.log("User signed in:", userCredential.uid);
                      })
                      .catch((error) => {
                        setLoginErrMsg(error.message);
                      });
                  } else {
                    setLoginErrMsg("Please enter Login Credential");
                  }
                }}
              >
                Login
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Container >
  );
}