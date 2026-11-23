// js/main.js

let currentBgColor = "#F5F5F7";
let currentFgColor = "#1D1D1F";
const symbolBoundsCache = {};
let isA3PrintMode = false;
let activeProduct = "bag";

document.addEventListener("DOMContentLoaded", () => {
    if (typeof adinkraSymbols === "undefined") {
        console.error("❌ ERROR: adinkraSymbols is not defined! Check js/symbols.js path.");
        return;
    }

    // 1. Populate Symbol Dropdown
    const symbolSelect = document.getElementById("symbolSelect");
    adinkraSymbols.forEach((sym, index) => {
        let option = document.createElement("option");
        option.value = index;
        option.textContent = sym.name;
        symbolSelect.appendChild(option);
    });

    // 2. Live UI Listeners
    symbolSelect.addEventListener("change", () => {
        updateSymbolMetadata();
        generatePattern();
    });

    document.getElementById("symmetrySelect").addEventListener("change", (e) => {
        const selectedText = e.target.options[e.target.selectedIndex].text;
        document.getElementById("activeSymmetryLabel").textContent = selectedText.replace(/^\d+\.\s*/, "");
        generatePattern();
    });

    const sliderIds = ["scaleSlider", "rotationSlider", "densitySlider", "shearXSlider", "shearYSlider"];
    sliderIds.forEach(id => {
        const el = document.getElementById(id);
        el.addEventListener("input", () => {
            document.getElementById(id.replace("Slider", "Value")).textContent = parseFloat(el.value).toFixed(1);
            generatePattern();
        });
    });

    document.getElementById("seedInput").addEventListener("input", generatePattern);
    document.getElementById("randomizeSeedBtn").addEventListener("click", () => {
        const randomSeed = "AKAN-" + Math.floor(Math.random() * 90000 + 10000);
        document.getElementById("seedInput").value = randomSeed;
        generatePattern();
    });

    // 3. Dark Mode Toggle Listener
    const darkModeBtn = document.getElementById("darkModeToggleBtn");
    darkModeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const isDark = document.body.classList.contains("dark-mode");
        darkModeBtn.textContent = isDark ? "☀️" : "🌙";
        
        if (isDark && currentBgColor === "#F5F5F7") {
            currentBgColor = "#1C1917";
            currentFgColor = "#F5F5F7";
            document.getElementById("canvasBg").setAttribute("fill", currentBgColor);
            generatePattern();
        } else if (!isDark && currentBgColor === "#1C1917") {
            currentBgColor = "#F5F5F7";
            currentFgColor = "#1D1D1F";
            document.getElementById("canvasBg").setAttribute("fill", currentBgColor);
            generatePattern();
        }
    });

    // 4. Color Swatches
    document.querySelectorAll(".swatch").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".swatch").forEach(s => s.classList.remove("active"));
            btn.classList.add("active");
            currentBgColor = btn.dataset.bg;
            currentFgColor = btn.dataset.fg;
            document.getElementById("canvasBg").setAttribute("fill", currentBgColor);
            document.getElementById("colorMeaningHint").textContent = btn.dataset.meaning;
            generatePattern();
        });
    });

    // 5. View Switcher Tabs & 10 Mockup Pills with Live Caption Sync
    const tabPattern = document.getElementById("tabPattern");
    const tabMockup = document.getElementById("tabMockup");
    const canvas2D = document.getElementById("canvas");
    const mockupCanvas = document.getElementById("mockupCanvas");
    const productSelector = document.getElementById("productSelector");

    tabPattern.addEventListener("click", () => {
        tabPattern.classList.add("active");
        tabMockup.classList.remove("active");
        canvas2D.classList.remove("hidden");
        mockupCanvas.classList.add("hidden");
        productSelector.classList.add("hidden");
        document.getElementById("activeSymmetryLabel").textContent = document.getElementById("symmetrySelect").options[document.getElementById("symmetrySelect").selectedIndex].text.replace(/^\d+\.\s*/, "");
    });

    tabMockup.addEventListener("click", () => {
        tabMockup.classList.add("active");
        tabPattern.classList.remove("active");
        canvas2D.classList.add("hidden");
        mockupCanvas.classList.remove("hidden");
        productSelector.classList.remove("hidden");
        document.getElementById("activeSymmetryLabel").textContent = "Live Textile Mockup";
        syncProductMockup();
    });

    const productKeys = ['bag', 'shirt', 'wrap', 'pillow', 'mug', 'scroll', 'journal', 'pin', 'phone', 'poster'];
    const labels = { 
        bag: "Tote Bag", shirt: "T-Shirt", wrap: "Wrapping Paper", 
        pillow: "Throw Pillow", mug: "Coffee Mug", scroll: "Woven Scroll", 
        journal: "Journal Notebook", pin: "Enamel Pin", phone: "Phone Case", poster: "Framed Poster" 
    };

    document.querySelectorAll(".pill-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".pill-btn").forEach(p => p.classList.remove("active"));
            btn.classList.add("active");
            activeProduct = btn.dataset.product;

            productKeys.forEach(key => {
                const groupEl = document.getElementById(`mockup${key.charAt(0).toUpperCase() + key.slice(1)}`);
                if (groupEl) {
                    groupEl.classList.toggle("hidden", activeProduct !== key);
                }
            });

            // Live caption update
            const symName = adinkraSymbols[document.getElementById("symbolSelect").value].name;
            document.getElementById("mockupCaption").textContent = `${symName} Collection • ${labels[activeProduct] || activeProduct}`;

            syncProductMockup();
        });
    });

    // 6. Action Buttons
    document.getElementById("generateBtn").addEventListener("click", generatePattern);
    document.getElementById("resetBtn").addEventListener("click", resetControls);
    document.getElementById("downloadBtn").addEventListener("click", exportSVG);
    document.getElementById("printA3Btn").addEventListener("click", toggleA3PrintMode);
    document.getElementById("downloadMockupPngBtn").addEventListener("click", exportMockupPNG);

    updateSymbolMetadata();
    generatePattern();
});

function updateSymbolMetadata() {
    const symIndex = document.getElementById("symbolSelect").value;
    const sym = adinkraSymbols[symIndex];
    document.getElementById("symbolMeaning").textContent = sym.meaning || "Traditional Akan Adinkra Motif";
}

function resetControls() {
    document.getElementById("scaleSlider").value = 1.0;
    document.getElementById("rotationSlider").value = 0;
    document.getElementById("densitySlider").value = 4;
    document.getElementById("shearXSlider").value = 0.0;
    document.getElementById("shearYSlider").value = 0.0;
    document.getElementById("seedInput").value = "AKAN-2026";
    
    document.getElementById("scaleValue").textContent = "1.0";
    document.getElementById("rotationValue").textContent = "0";
    document.getElementById("densityValue").textContent = "4";
    document.getElementById("shearXValue").textContent = "0.0";
    document.getElementById("shearYValue").textContent = "0.0";
    generatePattern();
}

function getSeededRandom(seedStr) {
    let hash = 1779033703 ^ seedStr.length;
    for (let i = 0; i < seedStr.length; i++) {
        hash = Math.imul(hash ^ seedStr.charCodeAt(i), 3432918353);
        hash = (hash << 13) | (hash >>> 19);
    }
    return function() {
        hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
        hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
        return ((hash ^= hash >>> 16) >>> 0) / 4294967296;
    };
}

function getNormalizedSymbolMetrics(symbol) {
    if (symbolBoundsCache[symbol.id]) return symbolBoundsCache[symbol.id];

    const svg = document.getElementById("canvas");
    const tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    tempPath.setAttribute("d", symbol.path);
    tempPath.setAttribute("visibility", "hidden");
    svg.appendChild(tempPath);

    const bbox = tempPath.getBBox();
    svg.removeChild(tempPath);

    const centerX = bbox.x + bbox.width / 2;
    const centerY = bbox.y + bbox.height / 2;
    const maxDim = Math.max(bbox.width, bbox.height) || 1;
    const baseNormalizeScale = 58 / maxDim;

    const metrics = { centerX, centerY, baseNormalizeScale };
    symbolBoundsCache[symbol.id] = metrics;
    return metrics;
}

function generatePattern() {
    const group = document.getElementById("patternGroup");
    group.innerHTML = "";

    const symIndex = document.getElementById("symbolSelect").value;
    const symmetryType = document.getElementById("symmetrySelect").value;
    const userScale = parseFloat(document.getElementById("scaleSlider").value);
    const baseRotation = parseFloat(document.getElementById("rotationSlider").value);
    const density = parseInt(document.getElementById("densitySlider").value, 10);
    const shearX = parseFloat(document.getElementById("shearXSlider").value);
    const shearY = parseFloat(document.getElementById("shearYSlider").value);
    const seedVal = document.getElementById("seedInput").value || "AKAN";

    const rng = getSeededRandom(seedVal);
    const baseSymbol = adinkraSymbols[symIndex];
    const metrics = getNormalizedSymbolMetrics(baseSymbol);
    const finalScale = userScale * metrics.baseNormalizeScale;

    const canvasSize = 500;
    const padding = 55;
    const usableArea = canvasSize - padding * 2;

    if (symmetryType === "translation") {
        const step = density > 1 ? usableArea / (density - 1) : 0;
        for (let r = 0; r < density; r++) {
            for (let c = 0; c < density; c++) {
                let targetX = density === 1 ? 250 : padding + c * step;
                let targetY = density === 1 ? 250 : padding + r * step;
                let jitterX = (rng() - 0.5) * 6;
                let jitterY = (rng() - 0.5) * 6;
                let transMat = createTranslationMatrix(targetX + jitterX, targetY + jitterY);
                let pos = applyMatrixToPoint(transMat, 0, 0);
                drawSymbol(group, baseSymbol.path, metrics, pos.x, pos.y, baseRotation, finalScale, finalScale, shearX, shearY);
            }
        }
    } else if (symmetryType === "reflection") {
        const step = density > 1 ? usableArea / (density - 1) : 0;
        for (let r = 0; r < density; r++) {
            for (let c = 0; c < density; c++) {
                let targetX = density === 1 ? 250 : padding + c * step;
                let targetY = density === 1 ? 250 : padding + r * step;
                let transMat = createTranslationMatrix(targetX, targetY);
                let pos = applyMatrixToPoint(transMat, 0, 0);
                let scaleX = (c % 2 !== 0) ? -finalScale : finalScale;
                let scaleY = (r % 2 !== 0) ? -finalScale : finalScale;
                drawSymbol(group, baseSymbol.path, metrics, pos.x, pos.y, baseRotation, scaleX, scaleY, shearX, shearY);
            }
        }
    } else if (symmetryType === "rotation") {
        const count = density * 2;
        const centerX = 250, centerY = 250;
        const rings = [95, 185];
        drawSymbol(group, baseSymbol.path, metrics, centerX, centerY, baseRotation, finalScale * 0.9, finalScale * 0.9, shearX, shearY);

        rings.forEach((radius, ringIdx) => {
            const ringCount = ringIdx === 0 ? Math.max(4, Math.floor(count / 2)) : count;
            for (let i = 0; i < ringCount; i++) {
                let angle = (360 / ringCount) * i;
                let rotMat = createRotationMatrix(angle);
                let offsetPoint = applyMatrixToPoint(rotMat, radius, 0);
                let transMat = createTranslationMatrix(centerX, centerY);
                let finalPos = applyMatrixToPoint(transMat, offsetPoint.x, offsetPoint.y);
                drawSymbol(group, baseSymbol.path, metrics, finalPos.x, finalPos.y, baseRotation + angle + 90, finalScale * 0.85, finalScale * 0.85, shearX, shearY);
            }
        });
    } else if (symmetryType === "glide") {
        const step = density > 1 ? usableArea / (density - 1) : 0;
        for (let r = 0; r < density; r++) {
            const isShiftedRow = r % 2 !== 0;
            const glideShift = isShiftedRow ? step * 0.5 : 0;
            for (let c = 0; c < density; c++) {
                let targetX = padding + c * step + glideShift;
                if (targetX > canvasSize - 25) continue;
                let targetY = padding + r * step;
                let transMat = createTranslationMatrix(targetX, targetY);
                let pos = applyMatrixToPoint(transMat, 0, 0);
                drawSymbol(group, baseSymbol.path, metrics, pos.x, pos.y, baseRotation, finalScale, isShiftedRow ? -finalScale : finalScale, shearX, shearY);
            }
        }
    } else if (symmetryType === "hexagonal") {
        const hexRadius = usableArea / (density * 1.65);
        const horizSpacing = hexRadius * 1.732;
        const vertSpacing = hexRadius * 1.5;
        const rows = Math.ceil(usableArea / vertSpacing) + 1;
        const cols = Math.ceil(usableArea / horizSpacing) + 1;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                let offsetX = (r % 2 !== 0) ? horizSpacing / 2 : 0;
                let targetX = padding + c * horizSpacing + offsetX;
                let targetY = padding + r * vertSpacing;
                if (targetX > canvasSize - padding + 15 || targetY > canvasSize - padding + 15) continue;
                let transMat = createTranslationMatrix(targetX, targetY);
                let pos = applyMatrixToPoint(transMat, 0, 0);
                drawSymbol(group, baseSymbol.path, metrics, pos.x, pos.y, baseRotation + ((r + c) % 3) * 60, finalScale * 0.85, finalScale * 0.85, shearX, shearY);
            }
        }
    }

    syncProductMockup();
}

function drawSymbol(group, pathData, metrics, x, y, rotation, scaleX, scaleY, shearX, shearY) {
    let container = document.createElementNS("http://www.w3.org/2000/svg", "g");
    container.setAttribute("transform", `translate(${x.toFixed(2)}, ${y.toFixed(2)}) rotate(${rotation}) scale(${scaleX.toFixed(4)}, ${scaleY.toFixed(4)}) skewX(${ (shearX * 45).toFixed(1) }) skewY(${ (shearY * 45).toFixed(1) })`);

    let pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathEl.setAttribute("d", pathData);
    pathEl.setAttribute("fill", currentFgColor);
    pathEl.setAttribute("transform", `translate(${-metrics.centerX.toFixed(2)}, ${-metrics.centerY.toFixed(2)})`);

    container.appendChild(pathEl);
    group.appendChild(container);
}

function syncProductMockup() {
    const patternHTML = document.getElementById("patternGroup").innerHTML;
    const products = ['Bag', 'Shirt', 'Wrap', 'Pillow', 'Mug', 'Scroll', 'Journal', 'Pin', 'Phone', 'Poster'];
    
    products.forEach(prod => {
        const bgEl = document.getElementById(`bg${prod}`);
        const targetEl = document.getElementById(`target${prod}`);
        if (bgEl) bgEl.setAttribute("fill", currentBgColor);
        if (targetEl) targetEl.innerHTML = patternHTML;
    });
}

function toggleA3PrintMode() {
    isA3PrintMode = !isA3PrintMode;
    const svgEl = document.getElementById("canvas");
    const dimTag = document.getElementById("activeSymmetryLabel");
    const btn = document.getElementById("printA3Btn");

    if (isA3PrintMode) {
        svgEl.setAttribute("viewBox", "0 0 708 1062");
        dimTag.textContent = "A3 Print Mode (277 × 420mm)";
        btn.textContent = "Exit A3 Print";
        btn.style.borderColor = "#0a84ff";
    } else {
        svgEl.setAttribute("viewBox", "0 0 500 500");
        dimTag.textContent = document.getElementById("symmetrySelect").options[document.getElementById("symmetrySelect").selectedIndex].text.replace(/^\d+\.\s*/, "");
        btn.textContent = "A3 Print View";
        btn.style.borderColor = "";
    }
    generatePattern();
}

function exportSVG() {
    const svgEl = document.getElementById("canvas");
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgEl);

    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const symName = adinkraSymbols[document.getElementById("symbolSelect").value].id;
    const seedName = document.getElementById("seedInput").value;

    link.href = url;
    link.download = `kente-${symName}-${seedName}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function exportMockupPNG() {
    syncProductMockup();
    const mockupSvg = document.getElementById("mockupCanvas");
    const symName = adinkraSymbols[document.getElementById("symbolSelect").value].name;
    const labels = { 
        bag: "Tote Bag", shirt: "T-Shirt", wrap: "Wrapping Paper", 
        pillow: "Throw Pillow", mug: "Coffee Mug", scroll: "Woven Scroll", 
        journal: "Journal Notebook", pin: "Enamel Pin", phone: "Phone Case", poster: "Framed Poster" 
    };
    document.getElementById("mockupCaption").textContent = `${symName} Collection • ${labels[activeProduct] || activeProduct}`;

    const exportSvg = mockupSvg.cloneNode(true);
    exportSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    const mockupGroups = ['Bag', 'Shirt', 'Wrap', 'Pillow', 'Mug', 'Scroll', 'Journal', 'Pin', 'Phone', 'Poster'];
    mockupGroups.forEach(groupName => {
        const group = exportSvg.querySelector(`#mockup${groupName}`);
        if (group) {
            group.setAttribute("display", groupName.toLowerCase() === activeProduct ? "inline" : "none");
        }
    });

    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(exportSvg);

    if (!svgString.match(/^<svg[^>]+xmlns=/)) {
        svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = 1200;
        canvas.height = 1200;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, 1200, 1200);
        URL.revokeObjectURL(url);

        const pngUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        const symId = adinkraSymbols[document.getElementById("symbolSelect").value].id;
        link.href = pngUrl;
        link.download = `mockup-${activeProduct}-${symId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    img.src = url;
}