import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const SnackbarContext = createContext(null);

const DEFAULTS = {
  severity: "info", // "success" | "info" | "warning" | "error"
  autoHideDuration: 4000, // ms; set to null to disable auto hide
  anchorOrigin: { vertical: "top", horizontal: "center" },
};

export function SnackbarProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState({ ...DEFAULTS, message: "", key: 0 });

  const showSnackbar = useCallback((message, opts = {}) => {
    // A new key remounts the Snackbar so the auto hide timer restarts
    setOptions({ ...DEFAULTS, ...opts, message, key: Date.now() });
    setOpen(true);
  }, []);

  const handleClose = useCallback((_event, reason) => {
    if (reason === "clickaway") return; // don't dismiss when clicking elsewhere
    setOpen(false);
  }, []);

  const api = useMemo(
    () => ({
      showSnackbar,
      success: (msg, opts) =>
        showSnackbar(msg, { ...opts, severity: "success" }),
      error: (msg, opts) => showSnackbar(msg, { ...opts, severity: "error" }),
      warning: (msg, opts) =>
        showSnackbar(msg, { ...opts, severity: "warning" }),
      info: (msg, opts) => showSnackbar(msg, { ...opts, severity: "info" }),
    }),
    [showSnackbar],
  );

  return (
    <SnackbarContext.Provider value={api}>
      {children}
      <Snackbar
        key={options.key}
        open={open}
        autoHideDuration={options.autoHideDuration}
        onClose={handleClose}
        anchorOrigin={options.anchorOrigin}
      >
        <Alert
          onClose={handleClose}
          severity={options.severity}
          variant="filled"
          sx={{
            width: "100%",
            ...(options.bgColor && {
              bgcolor: options.bgColor,
              color: options.textColor ?? "#fff",
              "& .MuiAlert-icon": { color: "inherit" },
            }),
          }}
        >
          {options.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx)
    throw new Error("useSnackbar must be used inside <SnackbarProvider>");
  return ctx;
}
