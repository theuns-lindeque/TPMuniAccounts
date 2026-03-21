"use client";

import React, { useState } from "react";
import { AlertTriangle, Edit3 } from "lucide-react";
import { saveFeedbackAction } from "@/app/(main)/actions/feedback";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import { Tooltip } from "@mui/material";

interface RisksPanelProps {
  report: {
    id: string;
    anomaliesFound: string[] | null;
  };
}

export const RisksPanel = ({ report }: RisksPanelProps) => {
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRisk || !feedback) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("analysisReportId", report.id);
    formData.append("fieldCorrected", "Risk Anomaly");
    formData.append("oldValue", selectedRisk);
    formData.append("newValue", "User Correction");
    formData.append("userNotes", feedback);

    await saveFeedbackAction(formData);

    setFeedback("");
    setSelectedRisk(null);
    setIsSubmitting(false);
  };

  return (
    <Box sx={{ h: "100%", overflowY: "auto" }}>
      <Stack spacing={2}>
        {report.anomaliesFound?.map((risk: string, idx: number) => (
          <Paper
            key={idx}
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              position: "relative",
              "&:hover": { borderColor: "primary.main" },
              transition: "border-color 0.2s",
            }}
          >
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <AlertTriangle size={18} color="#F79F01" style={{ marginTop: 2, shrink: 0 }} />
              <Typography variant="body2" sx={{ pr: 4, lineHeight: 1.6 }}>
                {risk}
              </Typography>
            </Stack>
            <Tooltip title="Correct AI Analysis">
              <IconButton
                size="small"
                onClick={() => setSelectedRisk(risk)}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  color: "primary.main",
                  opacity: 0.2,
                  "&:hover": { opacity: 1 },
                }}
              >
                <Edit3 size={14} />
              </IconButton>
            </Tooltip>
          </Paper>
        ))}
      </Stack>

      <Dialog
        open={Boolean(selectedRisk)}
        onClose={() => setSelectedRisk(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Refine AI Analysis</DialogTitle>
        <DialogContent>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              p: 2,
              bgcolor: "action.hover",
              borderRadius: 1,
              mb: 3,
              fontFamily: "monospace",
              color: "text.secondary",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            "{selectedRisk}"
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Add context or explain why this is a mistake..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            variant="outlined"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setSelectedRisk(null)} color="inherit" sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
