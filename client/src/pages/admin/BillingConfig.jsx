import React, { useState, useEffect } from "react";
import { Typography, Box, Button, Autocomplete, TextField } from "@mui/material";
import { useSnackbar } from "../../components/AppSnackbar";

const API_URL = process.env.REACT_APP_API_URL;
const LEVELS = ["Grade 11", "Grade 12", "1st Year", "2nd Year", "3rd Year"];

export default function BillingConfig() {
  const snackbar = useSnackbar();
  const [level, setLevel] = useState(null);
  const [fundedBy, setFundedBy] = useState("");
  const [coverage, setCoverage] = useState("100");
  const [fees, setFees] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!level) return;
    fetch(`${API_URL}/admin/billing?level=${encodeURIComponent(level)}`)
      .then((res) => res.json())
      .then((d) => {
        setFundedBy(d.fundedBy || (level.startsWith("Grade") ? "DepEd" : "TESDA"));
        setCoverage(String(d.coveragePercent));
        setFees(d.fees.map((f) => ({ label: f.label, amount: String(f.amount) })));
      })
      .catch(() => snackbar.error("Failed to load billing"));
    // eslint-disable-next-line
  }, [level]);

  const updateFee = (i, key, value) =>
    setFees((prev) => prev.map((f, idx) => (idx === i ? { ...f, [key]: value } : f)));
  const addFee = () => setFees((prev) => [...prev, { label: "", amount: "0" }]);
  const removeFee = (i) => setFees((prev) => prev.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/admin/billing/${encodeURIComponent(level)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fundedBy,
          coveragePercent: Number(coverage),
          fees: fees.map((f) => ({ label: f.label, amount: Number(f.amount) })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Save failed");
      snackbar.success(`Billing saved for ${level}`, { bgColor: "#3c9146" });
    } catch (err) {
      snackbar.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const total = fees.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

  return (
    <Box sx={{ backgroundColor: "#BAC5D1", minHeight: "100vh" }}>
      <Box
        sx={{
          backgroundColor: "#E8EDF2",
          minHeight: "100vh",
          width: { xs: "100%", sm: "600px", md: "1000px" },
          margin: "0 auto",
          p: { xs: 2, md: 5 },
        }}
      >
        <Typography sx={{ color: "#242c54", fontWeight: "bold", fontSize: { xs: "25px", sm: "35px" }, textAlign: "center", mb: 4 }}>
          Billing Configuration
        </Typography>

        <Autocomplete
          options={LEVELS}
          value={level}
          onChange={(_, v) => setLevel(v)}
          sx={{ width: { xs: "100%", sm: 400 }, mb: 3 }}
          renderInput={(params) => <TextField {...params} label="Grade / Year Level" />}
        />

        {level && (
          <>
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexDirection: { xs: "column", sm: "row" } }}>
              <TextField label="Covered by" value={fundedBy} onChange={(e) => setFundedBy(e.target.value)} fullWidth />
              <TextField
                label="Coverage (%)"
                type="number"
                inputProps={{ min: 0, max: 100 }}
                value={coverage}
                onChange={(e) => setCoverage(e.target.value)}
                fullWidth
              />
            </Box>

            <Typography sx={{ color: "#242c54", fontWeight: "bold", fontSize: "20px", mb: 1 }}>Fees</Typography>
            {fees.map((f, i) => (
              <Box key={i} sx={{ display: "flex", gap: 2, mb: 2, flexDirection: { xs: "column", sm: "row" } }}>
                <TextField label="Fee name" value={f.label} onChange={(e) => updateFee(i, "label", e.target.value)} fullWidth />
                <TextField
                  label="Amount (₱)"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={f.amount}
                  onChange={(e) => updateFee(i, "amount", e.target.value)}
                  fullWidth
                />
                <Button onClick={() => removeFee(i)} sx={{ color: "#791818" }}>Remove</Button>
              </Box>
            ))}

            <Button onClick={addFee} sx={{ color: "#242C54", mb: 2 }}>+ Add fee</Button>

            <Typography sx={{ color: "#242c54", fontWeight: "bold", mb: 3 }}>
              Total fees: ₱{total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </Typography>

            <Button
              onClick={handleSave}
              disabled={saving}
              sx={{
                color: "#E8EDF2",
                backgroundColor: "#242C54",
                width: 200,
                "&:hover": { backgroundColor: "#4f5d9e" },
                "&.Mui-disabled": { color: "#E8EDF2", opacity: 0.6 },
              }}
            >
              {saving ? "Saving..." : "Save Billing"}
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}