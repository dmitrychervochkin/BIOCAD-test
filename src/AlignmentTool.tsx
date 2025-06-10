import React, { useEffect, useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { styled, useMediaQuery, useTheme } from "@mui/system";

const aminoAcidColors: Record<string, string> = {
    A: "#67e446",
    R: "#bb99ff",
    N: "#80bfff",
    D: "#fc9cac",
    C: "#ffeao0",
    E: "#fc9cac",
    Q: "#80bfff",
    G: "#c4c4c4",
    H: "#80bfff",
    I: "#67e446",
    L: "#67e446",
    K: "#bb99ff",
    M: "#67e446",
    F: "#67e446",
    P: "#67e446",
    S: "#80bfff",
    T: "#80bfff",
    W: "#67e446",
    Y: "#67e446",
    V: "#67e446",
};

const isValidSequence = (seq: string) =>
    /^[ARNDCEQGHILKMFPSTWYV\-]+$/.test(seq);

const ChunkedRow = styled(Box)(({ theme }) => ({
    display: "flex",
    flexWrap: "wrap",
    wordBreak: "break-word",
    fontFamily: "monospace",
}));

const AminoBox = styled(Box)<{ bgcolor: string }>(({ bgcolor }) => ({
    padding: "2px 4px",
    margin: "1px",
    backgroundColor: bgcolor,
    color: "#000",
    borderRadius: "4px",
    minWidth: "20px",
    textAlign: "center",
}));

const Toast = ({ message, visible }: { message: string; visible: boolean }) => (
    <Box
        sx={{
            position: "fixed",
            top: 20,
            right: 20,
            padding: "10px 15px",
            backgroundColor: "#4caf50",
            color: "#fff",
            borderRadius: 1,
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            fontFamily: "Arial, sans-serif",
            fontSize: 14,
            opacity: visible ? 1 : 0,
            pointerEvents: "none",
            transition: "opacity 0.3s ease",
            zIndex: 9999,
        }}
    >
        {message}
    </Box>
);

const AlignmentTool: React.FC = () => {
    const [seq1, setSeq1] = useState("");
    const [seq2, setSeq2] = useState("");
    const [error, setError] = useState("");
    const [showAlignment, setShowAlignment] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);

    useEffect(() => {
        const onMouseUp = async () => {
            const selection = window.getSelection();
            if (!selection || selection.toString().trim().length === 0) return;

            const anchorNode = selection.anchorNode;
            const focusNode = selection.focusNode;

            const container = document.getElementById("amino-list");
            if (!container) return;

            const isInsideContainer = (node: Node | null): boolean => {
                if (!node) return false;
                return container.contains(node);
            };

            if (isInsideContainer(anchorNode) && isInsideContainer(focusNode)) {
                try {
                    await navigator.clipboard.writeText(
                        selection.toString().trim()
                    );
                    setToastVisible(true);
                    setTimeout(() => setToastVisible(false), 1000);
                } catch {
                    console.warn("Не удалось скопировать в буфер обмена");
                }
            }
        };

        document.addEventListener("mouseup", onMouseUp);
        return () => {
            document.removeEventListener("mouseup", onMouseUp);
        };
    }, []);

    const handleSubmit = () => {
        setShowAlignment(false);
        if (!seq1 || !seq2) {
            setError("Обе последовательности обязательны для заполнения.");
            return;
        }
        if (!isValidSequence(seq1) || !isValidSequence(seq2)) {
            setError(
                "Последовательности могут содержать только допустимые символы."
            );
            return;
        }
        if (seq1.length !== seq2.length) {
            setError("Последовательности должны быть одинаковой длины.");
            return;
        }
        setError("");
        setShowAlignment(true);
    };

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const CHUNK_SIZE = isMobile ? 9 : 20;

    const renderAlignment = (seq1: string, seq2: string) => {
        const chunks = [];
        for (let i = 0; i < seq1.length; i += CHUNK_SIZE) {
            const chunk1 = seq1.slice(i, i + CHUNK_SIZE);
            const chunk2 = seq2.slice(i, i + CHUNK_SIZE);
            chunks.push(
                <Box key={i} sx={{ mb: 1 }}>
                    <ChunkedRow>
                        {chunk1.split("").map((char, idx) => (
                            <AminoBox
                                key={idx}
                                bgcolor={aminoAcidColors[char] || "#FFF"}
                            >
                                {char}
                            </AminoBox>
                        ))}
                    </ChunkedRow>
                    <ChunkedRow>
                        {chunk2.split("").map((char, idx) => {
                            const refChar = chunk1[idx];
                            return (
                                <AminoBox
                                    key={idx}
                                    bgcolor={
                                        char !== refChar
                                            ? aminoAcidColors[char] || "#FFF"
                                            : "transparent"
                                    }
                                >
                                    {char}
                                </AminoBox>
                            );
                        })}
                    </ChunkedRow>
                </Box>
            );
        }
        return chunks;
    };

    const handleSeqChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        setter: React.Dispatch<React.SetStateAction<string>>
    ) => {
        const value = e.target.value.toUpperCase();
        const filtered = value.replace(/[^ARNDCEQGHILKMFPSTWYV\-]/gi, "");
        setter(filtered);
        setShowAlignment(false);
        setError("");
    };

    const handleClear = () => {
        setSeq1("");
        setSeq2("");
        setError("");
        setShowAlignment(false);
    };

    function getLabel(number: number, seq2: string) {
        return `Последовательность ${number}${
            seq2.length !== 0 ? " - Длина: " + seq2.length : ""
        }`;
    }

    return (
        <Box
            sx={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                m: "40px 0",
                alignItems: "center",
                p: 2,
            }}
        >
            <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
                Тестовое задание для BIOCAD
            </Typography>
            <Box sx={{ maxWidth: "600px", width: "100%" }}>
                <Grid container spacing={2} direction="column">
                    <Grid>
                        <TextField
                            fullWidth
                            label={getLabel(1, seq1)}
                            value={seq1}
                            onChange={(e) => handleSeqChange(e, setSeq1)}
                            error={!!error}
                        />
                    </Grid>
                    <Grid>
                        <TextField
                            fullWidth
                            label={getLabel(2, seq2)}
                            value={seq2}
                            onChange={(e) => handleSeqChange(e, setSeq2)}
                            error={!!error}
                        />
                    </Grid>
                    {error && (
                        <Grid>
                            <Typography color="error">{error}</Typography>
                        </Grid>
                    )}
                    <Grid>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleSubmit}
                        >
                            Сравнить
                        </Button>
                    </Grid>
                    <Grid>
                        <Button
                            fullWidth
                            variant="outlined"
                            color="secondary"
                            onClick={handleClear}
                        >
                            Очистить
                        </Button>
                    </Grid>
                    {showAlignment && (
                        <Grid id="amino-list">
                            {renderAlignment(seq1, seq2)}
                        </Grid>
                    )}
                </Grid>
            </Box>
            <Toast
                message="Последовательность скопирована"
                visible={toastVisible}
            />
        </Box>
    );
};

export default AlignmentTool;
