import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
} from "@mui/material";

const API = process.env.REACT_APP_API_URL || "";
const KEY = "masterUnlockUntil";
const TOKEN_KEY = "masterToken";

const isUnlocked = () =>
  Date.now() < Number(sessionStorage.getItem(KEY) || 0) &&
  !!sessionStorage.getItem(TOKEN_KEY);

export function MasterPasswordRoute() {
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(isUnlocked);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (unlocked) return <Outlet />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/verify-master`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // use however you currently store it
        },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Incorrect password.");
        return;
      }
      const { masterToken, expiresIn } = await res.json();
      sessionStorage.setItem(TOKEN_KEY, masterToken);
      sessionStorage.setItem(KEY, String(Date.now() + expiresIn));
      setUnlocked(true);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
      setPassword("");
    }
  };

  return (
    <Dialog
      open
      maxWidth="xs"
      fullWidth
      onClose={() => navigate("/admin", { replace: true })}
    >
      <form onSubmit={submit}>
        <DialogTitle
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 1,
            mb: 3,
          }}
        >
          <Box
            component="img"
            src="/resources/atec-word-logo.png"
            alt="Logo"
            sx={{
              maxWidth: { xs: "200px", md: "300px" },
              height: "auto",
              mb: 1,
            }}
          />
          <b>Please verify your eligibility first!</b>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Enter the main admin's password to access system settings.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error}
            helperText={error}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate("/admin", { replace: true })}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={busy || !password}
          >
            Unlock
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
