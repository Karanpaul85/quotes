"use client";
import { use, useEffect, useRef, useState } from "react";
import styles from "./addQuotes.module.css";
import { allFonts, colors, defaultTextStyles } from "@/utils/commonUtils";
const AddQuote = () => {
  const bgCanvas = useRef(null);
  const textCanvas = useRef(null);
  const canvasParent = useRef(null);

  const [canvasHeight, setCanvasHeight] = useState(0);
  const [quote, setQuote] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);
  const [textStyles, setTextStyles] = useState(defaultTextStyles);

  useEffect(() => {
    const height = canvasParent.current && canvasParent.current.offsetWidth;
    setCanvasHeight(height);
  }, []);

  useEffect(() => {
    writeText(quote);
  }, [textStyles]);

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

    const maxWidth = textCanvas.current.width - 50; // padding
    const maxHeight = textCanvas.current.height - 20; // vertical padding

    let lineHeight = fontSize * 1.2;
    let wrappedLines;

    let runningFontSize = fontSize; // Avoid mutating fontSize
    do {
      textCtx.font = `${runningFontSize}px ${fontFamily}`;
      lineHeight = runningFontSize * 1.2;

      // Split paragraphs by \n, and wrap each paragraph separately
      const paragraphs = quote.split(/\r?\n/);
      wrappedLines = [];

      for (const paragraph of paragraphs) {
        if (paragraph.trim() === "") {
          // Empty/newline-only paragraph
          wrappedLines.push(""); // This draws an empty line (paragraph break)
          continue;
        }
        const words = paragraph.split(" ");
        let currentLine = words[0];
        for (let i = 1; i < words.length; i++) {
          const word = words[i];
          const width = textCtx.measureText(currentLine + " " + word).width;
          if (width < maxWidth) {
            currentLine += " " + word;
          } else {
            wrappedLines.push(currentLine);
            currentLine = word;
          }
        }
        wrappedLines.push(currentLine);
      }

      // Calculate totalHeight with paragraph breaks
      const totalHeight = wrappedLines.length * lineHeight;
      if (totalHeight > maxHeight) {
        runningFontSize -= 2;
      } else {
        break;
      }
    } while (runningFontSize > 10); // Prevent too small font

    // Draw final text
    textCtx.fillStyle = defaultTextColor;
    textCtx.font = `${runningFontSize}px ${fontFamily}`;
    textCtx.textAlign = "center";

    const totalHeight = wrappedLines.length * lineHeight;
    let y = (textCanvas.current.height - totalHeight) / 2 + lineHeight;

    for (let line of wrappedLines) {
      textCtx.fillText(line, textCanvas.current.width / 2, y);
      y += lineHeight;
    }
  };

  //set color selected by user
  const setColor = (color) => {
    setTextStyles((prevStyles) => ({
      ...prevStyles,
      defaultTextColor: color,
    }));
  };

  const drawQuote = async (img) => {
    if (!bgCanvas.current) return;
    const ctx = bgCanvas.current.getContext("2d");
    ctx.clearRect(0, 0, bgCanvas.current.width, bgCanvas.current.height);
    ctx.drawImage(img, 0, 0);
    // Draw black overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; // 0.5 is opacity; change as needed
    ctx.fillRect(0, 0, bgCanvas.current.width, bgCanvas.current.height);
  };

  //handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsDisabled(false);
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = new Image();
        img.src = e.target.result;
        img.onload = function () {
          bgCanvas.current.width = img.width;
          bgCanvas.current.height = img.height;
          textCanvas.current.width = img.width;
          textCanvas.current.height = img.height;
          if (img.width > img.height) {
            bgCanvas.current.style.width = "100%";
            bgCanvas.current.style.height = "auto";
            textCanvas.current.style.width = "100%";
            textCanvas.current.style.height = "auto";
          } else {
            bgCanvas.current.style.width = "auto";
            bgCanvas.current.style.height = "100%";
            textCanvas.current.style.width = "auto";
            textCanvas.current.style.height = "100%";
          }
          drawQuote(img);
          // dom.otherSec.classList.remove("disabled");
          // dom.imageInputSec.style.display = "none"; // Hide the input after image is loaded
          // setFontFamilyOptions();
        };
      };
      reader.readAsDataURL(file);
    }
  };
  //handle quote input
  const handleQuoteInput = (event) => {
    setQuote(event.target.value);
    const input = event.target;
    input.style.height = "auto"; // Reset height
    input.style.height = input.scrollHeight + "px"; // Set to new scroll height
    console.log("Quote input changed", event.target.value);
    writeText(event.target.value);
  };

  const handleClearQuotes = () => {
    setQuote("");
    setTextStyles(defaultTextStyles);
    setIsDisabled(true);
    if (bgCanvas.current) {
      const ctx = bgCanvas.current.getContext("2d");
      ctx.clearRect(0, 0, bgCanvas.current.width, bgCanvas.current.height);
    }
    if (textCanvas.current) {
      const ctx = textCanvas.current.getContext("2d");
      ctx.clearRect(0, 0, textCanvas.current.width, textCanvas.current.height);
    }
  };

  const handleShareQuote = () => {
    if (!bgCanvas.current || !textCanvas.current || !quote) {
      console.error("Canvas or quote is not ready for sharing.");
      return;
    }
    if (!bgCanvas.current) return;
    const ctx = bgCanvas.current.getContext("2d");

    const quotesDataUrl = textCanvas.current.toDataURL("image/png");
    const img = new Image();
    img.src = quotesDataUrl;
    img.onload = function () {
      console.log("Image loaded for sharing", img);
      ctx.drawImage(img, 0, 0, bgCanvas.current.width, bgCanvas.current.height);
    };

    setTimeout(() => {
      const link = document.createElement("a");
      link.download = "quote.jpeg";
      link.href = bgCanvas.current.toDataURL("image/jpeg");
      link.click();
    }, 1000); // Delay to ensure image is drawn before download
  };

  return (
    <div className={styles.addQuoteContainer}>
      <h1>Add a Quote</h1>
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
              onChange={(e) => handleQuoteInput(e)}
            ></textarea>
          </div>
          <div className={styles.sec}>
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setColor(color)}
                style={{ backgroundColor: color }}
              ></button>
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
                setTextStyles({ ...textStyles, fontSize: e.target.value })
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
                setTextStyles((prev) => ({
                  ...prev,
                  fontFamily: newFont,
                }));
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
            <button id="shareQuoteButton" onClick={handleShareQuote}>
              Share Quote
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
