"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./addQuotes.module.css";
import {
  allFonts,
  colors,
  defaultTextStyles,
  quotesType,
} from "@/utils/commonUtils";

// Debounce function to limit how often a function fires
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Helper to calculate scaling and target dimensions
function getScaledDimensions(imgWidth, imgHeight, maxDim = 1024) {
  let scale = 1;
  if (imgWidth > maxDim || imgHeight > maxDim) {
    scale = Math.min(maxDim / imgWidth, maxDim / imgHeight);
  }
  return {
    width: Math.round(imgWidth * scale),
    height: Math.round(imgHeight * scale),
  };
}

const AddQuote = () => {
  const bgCanvas = useRef(null);
  const textCanvas = useRef(null);
  const canvasParent = useRef(null);

  const [canvasHeight, setCanvasHeight] = useState(0);
  const [quote, setQuote] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);
  const [textStyles, setTextStyles] = useState(defaultTextStyles);
  const [isCanvasBusy, setIsCanvasBusy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [finalData, setFinalData] = useState(null);

  const [selectedQuotesType, setSelectedQuotesType] = useState(
    Object.keys(quotesType)[0]
  );
  const [occasionOptions, setOccasionOptions] = useState(
    quotesType[selectedQuotesType] || []
  );
  const [selectedOccasionType, setSelectedOccasionType] = useState(
    occasionOptions[0] || ""
  );

  // Set canvas height on mount
  useEffect(() => {
    if (canvasParent.current) {
      setCanvasHeight(canvasParent.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    const updatedOccasions = quotesType[selectedQuotesType] || [];
    setOccasionOptions(updatedOccasions);
    setSelectedOccasionType(updatedOccasions[0] || "");
  }, [selectedQuotesType]);

  // Debounced update when text styles change
  const debouncedWriteText = useCallback(
    debounce((text) => writeText(text), 100),
    [textStyles, textCanvas, quote]
  );

  useEffect(() => {
    debouncedWriteText(quote);
  }, [textStyles, debouncedWriteText, quote]);

  // Main text drawing function
  const writeText = (quote) => {
    if (!textCanvas.current) return;
    const { defaultTextColor, fontSize, fontFamily } = textStyles;
    const textCtx = textCanvas.current.getContext("2d");
    textCtx.clearRect(
      0,
      0,
      textCanvas.current.width,
      textCanvas.current.height
    );

    const maxWidth = textCanvas.current.width - 50;
    const maxHeight = textCanvas.current.height - 20;
    let lineHeight = fontSize * 1.2;
    let wrappedLines,
      runningFontSize = fontSize;

    do {
      textCtx.font = `${runningFontSize}px ${fontFamily}`;
      lineHeight = runningFontSize * 1.2;

      wrappedLines = [];
      for (const paragraph of quote.split(/\r?\n/)) {
        if (!paragraph.trim()) {
          wrappedLines.push("");
          continue;
        }
        const words = paragraph.split(" ");
        let currentLine = words[0];
        for (let i = 1; i < words.length; i++) {
          const word = words[i];
          if (textCtx.measureText(currentLine + " " + word).width < maxWidth) {
            currentLine += " " + word;
          } else {
            wrappedLines.push(currentLine);
            currentLine = word;
          }
        }
        wrappedLines.push(currentLine);
      }
      if (wrappedLines.length * lineHeight > maxHeight) runningFontSize -= 2;
      else break;
    } while (runningFontSize > 10);

    // Draw final text
    textCtx.fillStyle = defaultTextColor;
    textCtx.font = `${runningFontSize}px ${fontFamily}`;
    textCtx.textAlign = "center";

    let y =
      (textCanvas.current.height - wrappedLines.length * lineHeight) / 2 +
      lineHeight;
    wrappedLines.forEach((line) => {
      textCtx.fillText(line, textCanvas.current.width / 2, y);
      y += lineHeight;
    });
  };

  // Modern color setter
  const setColor = (color) => {
    setTextStyles((prev) => ({ ...prev, defaultTextColor: color }));
  };

  // Clean image drawing function, uses scaling helper
  const drawQuote = async (img) => {
    if (!bgCanvas.current) return;
    setIsCanvasBusy(true);
    const ctx = bgCanvas.current.getContext("2d");
    const { width, height } = getScaledDimensions(img.width, img.height);

    bgCanvas.current.width = width;
    bgCanvas.current.height = height;

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, width, height);

    setIsCanvasBusy(false);
  };

  // Image upload handler
  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsDisabled(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.src = e.target.result;
      img.onload = () => {
        const { width, height } = getScaledDimensions(img.width, img.height);

        [bgCanvas, textCanvas].forEach((ref) => {
          if (ref.current) {
            ref.current.width = width;
            ref.current.height = height;
            ref.current.style.width = img.width > img.height ? "100%" : "auto";
            ref.current.style.height = img.width > img.height ? "auto" : "100%";
          }
        });

        drawQuote(img);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleQuoteInput = (event) => {
    setQuote(event.target.value);
    const input = event.target;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
    debouncedWriteText(event.target.value);
  };

  const handleClearQuotes = () => {
    setQuote("");
    setTextStyles(defaultTextStyles);
    setIsDisabled(true);
    [bgCanvas, textCanvas].forEach((ref) => {
      if (ref.current) {
        const ctx = ref.current.getContext("2d");
        ctx.clearRect(0, 0, ref.current.width, ref.current.height);
      }
    });
  };

  const openShare = async () => {
    console.log(selectedQuotesType.toLowerCase(), selectedOccasionType.replace(/[' ]/g, match => match === " " ? "_" : "").toLowerCase());
    const response = await fetch(finalData?.url);
    const blob = await response.blob();

    const file = new File([blob], "image.jpg", { type: blob.type });
    const url = `${window.location.origin}/singlequote/${finalData.bucketName}/${finalData.imageName}`;

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: finalData?.imageName,
        text: "Check out this image!",
        files: [file],
        url: url,
      });
    } else {
      alert("Sharing not supported on this device.");
    }
  };

  const handleShareQuote = async () => {
    if (!bgCanvas.current || !textCanvas.current || !quote) {
      console.error("Canvas or quote is not ready for sharing.");
      return null;
    }

    return new Promise((resolve, reject) => {
      const ctx = bgCanvas.current.getContext("2d");
      const quotesDataUrl = textCanvas.current.toDataURL("image/png");
      const img = new window.Image();
      img.src = quotesDataUrl;

      img.onload = async () => {
        try {
          ctx.drawImage(
            img,
            0,
            0,
            bgCanvas.current.width,
            bgCanvas.current.height
          );

          if (!isCanvasBusy) {
            const finalImageData = bgCanvas.current.toDataURL("image/jpeg");

            const response = await fetch("/api/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ imageData: finalImageData, quote: quote }),
            });

            const data = await response.json();

            if (data?.url && data?.bucketName && data?.imageName) {
              resolve(data); // resolve final data
            } else {
              reject(new Error("Missing fields in response"));
            }
          }
        } catch (error) {
          console.error("Upload failed", error);
          reject(error);
        }
      };

      img.onerror = (err) => {
        console.error("Image failed to load", err);
        reject(err);
      };
    });
  };

  const sharePopup = ({ finalData, quotesType }) => {
    return (
      <div className={styles.popup}>
        <div className={styles.popupImage}>
          <img
            src={finalData?.url}
            alt={finalData?.imageName || "Quote Image"}
          />
        </div>
        <div className={styles.popupSelect}>
          <div className={styles.select}>
            <span>Select Quotes Type</span>
            <select
              id="quotesTypes"
              value={selectedQuotesType}
              onChange={(e) => setSelectedQuotesType(e.target.value)}
            >
              {Object.keys(quotesType).map((quoteType) => (
                <option key={quoteType} value={quoteType}>
                  {quoteType}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.select}>
            <span>Select Occasion Type</span>
            <select
              id="occasionTypes"
              value={selectedOccasionType}
              onChange={(e) => setSelectedOccasionType(e.target.value)}
            >
              {occasionOptions.map((occasion) => (
                <option key={occasion} value={occasion}>
                  {occasion}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button onClick={openShare}>Share</button>
      </div>
    );
  };

  const handleCreateQuote = async () => {
    setIsLoading(true);
    try {
      const finalData = await handleShareQuote();
      setFinalData(finalData);
      // Optionally trigger popup if needed
      // if (finalData) sharePopup(finalData);
    } catch (error) {
      console.error("Error creating quote:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.addQuoteContainer}>
      <h1>Add a Quote</h1>
      {isLoading && "Please wait we are generate image for sharing"}
      {finalData && sharePopup({ finalData, quotesType })}
      <div className={styles.quotesCanvas}>
        <div
          className={styles.canvasSec}
          style={{ height: canvasHeight }}
          ref={canvasParent}
        >
          <canvas
            id="quotesCanvas"
            width="1024"
            height="1024"
            ref={bgCanvas}
          ></canvas>
          <canvas
            id="textCanvas"
            width="1024"
            height="1024"
            ref={textCanvas}
          ></canvas>
        </div>
        {isDisabled && (
          <div className={styles.sec} id="imageInputSec">
            <label htmlFor="imageInput">Upload Quotes Background</label>
            <input
              type="file"
              id="imageInput"
              onChange={handleImageUpload}
              accept="image/*"
            />
          </div>
        )}
        <div
          className={`${styles.otherSec} ${isDisabled ? styles.disabled : ""}`}
        >
          <div className={styles.sec}>
            <textarea
              id="quoteInput"
              placeholder="Enter your quote here..."
              style={{ overflow: "hidden", resize: "none" }}
              value={quote}
              onChange={handleQuoteInput}
            />
          </div>
          <div className={styles.sec}>
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setColor(color)}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className={styles.sec}>
            <input
              type="range"
              id="fontSizeRange"
              min="10"
              max="100"
              value={textStyles.fontSize}
              step="1"
              onChange={(e) =>
                setTextStyles({
                  ...textStyles,
                  fontSize: Number(e.target.value),
                })
              }
            />
          </div>
          <div className={styles.sec}>
            <select
              id="fontFamilyInput"
              value={textStyles.fontFamily}
              onChange={async (e) => {
                const newFont = e.target.value;
                await document.fonts.load(`16px ${newFont}`);
                setTextStyles((prev) => ({ ...prev, fontFamily: newFont }));
              }}
            >
              {allFonts.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.sec}>
            <button id="shareQuoteButton" onClick={handleCreateQuote}>
              Create Quote
            </button>
            <button id="clearQuotesButton" onClick={handleClearQuotes}>
              Clear Quotes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddQuote;
