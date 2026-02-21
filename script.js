// Отримуємо всі необхідні елементи
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const imageInput = document.getElementById("imageInput");
const watermarkText = document.getElementById("watermarkText");
const fontFamily = document.getElementById("fontFamily");
const opacity = document.getElementById("opacity");
const fontSize = document.getElementById("fontSize");
const textColor = document.getElementById("textColor");
const textDirection = document.getElementById("textDirection");
const fillMode = document.getElementById("fillMode");
const spacing = document.getElementById("spacing");
const spacingLabel = document.getElementById("spacingLabel");

// Нові елементи для збереження
const saveFormat = document.getElementById("saveFormat");
const jpegQuality = document.getElementById("jpegQuality");
const jpegQualityLabel = document.getElementById("jpegQualityLabel");
const fileName = document.getElementById("fileName");
const addDateToFileName = document.getElementById("addDateToFileName");

let originalImage = null;
let originalFileName = "";

// Показуємо/ховаємо налаштування відстані для режиму заливки
fillMode.addEventListener("change", () => {
  spacingLabel.style.display = fillMode.value === "single" ? "none" : "block";
  if (originalImage) draw();
});

// Показуємо/ховаємо налаштування якості
saveFormat.addEventListener("change", () => {
  jpegQualityLabel.style.display =
    saveFormat.value === "jpeg" || saveFormat.value === "webp"
      ? "block"
      : "none";
});

// Отримуємо оригінальну назву файлу при завантаженні
imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    // Зберігаємо оригінальну назву файлу без розширення
    originalFileName = file.name.replace(/\.[^/.]+$/, "");

    // Пропонуємо назву за замовчуванням на основі оригіналу
    fileName.value = `${originalFileName}_watermarked`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        originalImage = img;
        draw();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// Функція для форматування дати
function getFormattedDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}_${hours}-${minutes}`;
}

// Функція для створення назви файлу
function generateFileName() {
  let baseName = fileName.value.trim();

  // Якщо поле порожнє, використовуємо значення за замовчуванням
  if (!baseName) {
    baseName = originalFileName
      ? `${originalFileName}_watermarked`
      : "watermarked-document";
  }

  // Очищуємо назву від заборонених символів
  baseName = baseName.replace(/[<>:"\/\\|?*]/g, "_");

  // Додаємо дату, якщо вибрано
  if (addDateToFileName.checked) {
    baseName = `${baseName}_${getFormattedDate()}`;
  }

  return baseName;
}

// Функція для малювання одного тексту
function drawSingleText(
  text,
  font,
  fontSizePx,
  opacityValue,
  color,
  direction,
) {
  ctx.save();

  ctx.globalAlpha = opacityValue;
  ctx.fillStyle = color;
  ctx.font = `bold ${fontSizePx}px ${font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.translate(canvas.width / 2, canvas.height / 2);

  switch (direction) {
    case "horizontal":
      break;
    case "vertical":
      ctx.rotate(-Math.PI / 2);
      break;
    case "diagonal-reverse":
      ctx.rotate(Math.PI / 4);
      break;
    case "diagonal":
    default:
      ctx.rotate(-Math.PI / 4);
  }

  ctx.fillText(text, 0, 0);
  ctx.restore();
}

// Функція для заливки текстом
function drawTileText(
  text,
  font,
  fontSizePx,
  opacityValue,
  color,
  direction,
  spacingValue,
) {
  ctx.save();

  ctx.globalAlpha = opacityValue;
  ctx.fillStyle = color;
  ctx.font = `bold ${fontSizePx}px ${font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const textWidth = ctx.measureText(text).width;
  const textHeight = fontSizePx;

  const stepX = textWidth * (spacingValue / 100);
  const stepY = textHeight * (spacingValue / 100);

  for (let y = -canvas.height; y < canvas.height * 2; y += stepY) {
    for (let x = -canvas.width; x < canvas.width * 2; x += stepX) {
      ctx.save();

      if (fillMode.value === "diagonal-tile") {
        ctx.translate(x + (y % (stepY * 2) === 0 ? stepX / 2 : 0), y);
      } else {
        ctx.translate(x, y);
      }

      switch (direction) {
        case "horizontal":
          break;
        case "vertical":
          ctx.rotate(-Math.PI / 2);
          break;
        case "diagonal-reverse":
          ctx.rotate(Math.PI / 4);
          break;
        case "diagonal":
          ctx.rotate(-Math.PI / 4);
          break;
      }

      ctx.fillText(text, 0, 0);
      ctx.restore();
    }
  }

  ctx.restore();
}

// Основна функція малювання
function draw() {
  if (!originalImage) return;

  canvas.width = originalImage.width;
  canvas.height = originalImage.height;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(originalImage, 0, 0);

  const text = watermarkText.value || "ВАШ ТЕКСТ";
  const font = fontFamily.value;
  const opacityValue = parseFloat(opacity.value);
  const sizePercent = parseFloat(fontSize.value);
  const color = textColor.value;
  const direction = textDirection.value;
  const mode = fillMode.value;
  const spacingValue = parseFloat(spacing.value);

  const fontSizePx = (canvas.width * sizePercent) / 100;

  if (mode === "single") {
    drawSingleText(text, font, fontSizePx, opacityValue, color, direction);
  } else {
    drawTileText(
      text,
      font,
      fontSizePx,
      opacityValue,
      color,
      direction,
      spacingValue,
    );
  }
}

// Оновлення при зміні параметрів
[
  watermarkText,
  fontFamily,
  opacity,
  fontSize,
  textColor,
  textDirection,
  fillMode,
  spacing,
].forEach((el) => {
  el.addEventListener("input", () => {
    if (originalImage) draw();
  });
});

// Оновлена функція завантаження
document.getElementById("downloadBtn").addEventListener("click", () => {
  if (!originalImage) {
    alert("Спочатку завантажте зображення!");
    return;
  }

  const link = document.createElement("a");
  const format = saveFormat.value;
  const quality = parseFloat(jpegQuality.value);

  // Генеруємо назву файлу
  const baseFileName = generateFileName();

  // Встановлюємо MIME тип та розширення
  let extension = "png";
  let mimeType = "image/png";

  switch (format) {
    case "jpeg":
      extension = "jpg";
      mimeType = "image/jpeg";
      break;
    case "webp":
      extension = "webp";
      mimeType = "image/webp";
      break;
    default:
      extension = "png";
      mimeType = "image/png";
  }

  // Створюємо дані для збереження
  if (format === "jpeg" || format === "webp") {
    link.href = canvas.toDataURL(mimeType, quality);
  } else {
    link.href = canvas.toDataURL(mimeType);
  }

  // Встановлюємо повну назву файлу
  link.download = `${baseFileName}.${extension}`;
  link.click();

  // Показуємо повідомлення про успішне збереження
  console.log(`Файл збережено як: ${link.download}`);
});

// Додаємо автозаповнення назви файлу при зміні тексту ватермарки
watermarkText.addEventListener("input", () => {
  if (originalImage && fileName.value === `${originalFileName}_watermarked`) {
    // Якщо назва не змінена вручну, оновлюємо її автоматично
    const newText = watermarkText.value
      .replace(/[^a-zA-Z0-9а-яА-ЯїЇєЄіІ]/g, "_")
      .substring(0, 20);
    if (newText) {
      fileName.value = `${originalFileName}_${newText}`;
    }
  }
});

// Валідація назви файлу в реальному часі
fileName.addEventListener("input", () => {
  // Показуємо попередження якщо є заборонені символи
  const invalidChars = fileName.value.match(/[<>:"\/\\|?*]/g);
  if (invalidChars) {
    fileName.style.borderColor = "red";
    fileName.title =
      "Заборонені символи: " + [...new Set(invalidChars)].join(" ");
  } else {
    fileName.style.borderColor = "#ccc";
    fileName.title = "";
  }
});
