import "./style.css";
import { registerSW } from "virtual:pwa-register";

type Elephant = {
  id: number;
  element: HTMLImageElement;
};

const TOTAL_ELEPHANTS = 20;
const MINUTE_MS = 60_000;
const DURATION_OPTIONS_MINUTES = [2, 4, 6] as const;
const assetPath = (fileName: string): string =>
  `${import.meta.env.BASE_URL}${fileName}`;
const DURATION_IMAGE_BY_MINUTES: Record<
  (typeof DURATION_OPTIONS_MINUTES)[number],
  string
> = {
  2: assetPath("eier2min.png"),
  4: assetPath("eier4min.png"),
  6: assetPath("eier6min.png"),
};
const ELEPHANT_IMAGE_PATH = assetPath("elephant.gif");
const FALLBACK_SIZE = 120;

registerSW({ immediate: true });

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App container #app not found");
}

const scene = document.createElement("div");
scene.className = "scene";
app.append(scene);

const infoContainer = document.createElement("div");
infoContainer.className = "info";

const infoButton = document.createElement("button");
infoButton.className = "info-button";
infoButton.type = "button";
infoButton.setAttribute("aria-label", "Installationshinweise anzeigen");
infoButton.textContent = "i";

const infoTooltip = document.createElement("div");
infoTooltip.className = "info-tooltip";
infoTooltip.innerHTML =
  "<strong>Eieruhr als PWA installieren</strong><br><br>" +
  "iOS (Safari): Teilen → Zum Home-Bildschirm → Hinzufügen.<br><br>" +
  "Android (Chrome): App installieren oder Zum Startbildschirm hinzufügen.";

infoContainer.append(infoButton, infoTooltip);
scene.append(infoContainer);

const durationControls = document.createElement("div");
durationControls.className = "duration-controls";
scene.append(durationControls);

let selectedTotalDurationMs = DURATION_OPTIONS_MINUTES[0] * MINUTE_MS;

for (const minutes of DURATION_OPTIONS_MINUTES) {
  const durationButton = document.createElement("button");
  durationButton.className = "duration-button";
  durationButton.type = "button";
  durationButton.dataset.minutes = `${minutes}`;

  const icon = document.createElement("img");
  icon.className = "duration-button-icon";
  icon.src = DURATION_IMAGE_BY_MINUTES[minutes];
  icon.alt = "";
  icon.setAttribute("aria-hidden", "true");

  const label = document.createElement("span");
  label.className = "duration-button-label";
  label.textContent = `${minutes} Min.`;

  durationButton.append(icon, label);

  durationButton.addEventListener("click", () => {
    selectedTotalDurationMs = minutes * MINUTE_MS;
    setSelectedDurationButton(minutes);
    resetScene();
  });

  durationControls.append(durationButton);
}

const restartButton = document.createElement("button");
restartButton.className = "restart-button";
restartButton.type = "button";
restartButton.textContent = "Neu starten";
scene.append(restartButton);

let elephants: Elephant[] = [];
let activeRunId = 0;
let baseElephantWidth = FALLBACK_SIZE;
let baseElephantHeight = FALLBACK_SIZE;
let elephantWidth = FALLBACK_SIZE;
let elephantHeight = FALLBACK_SIZE;

void initialize();

restartButton.addEventListener("click", () => {
  resetScene();
});

window.addEventListener("resize", () => {
  updateElephantSizeForViewport();

  for (const elephant of elephants) {
    if (elephant.element.isConnected) {
      elephant.element.width = elephantWidth;
      elephant.element.height = elephantHeight;
    }
  }

  for (const elephant of elephants) {
    if (elephant.element.isConnected) {
      keepInsideViewport(elephant.element);
    }
  }
});

function placeRandomly(element: HTMLImageElement): void {
  const { width, height } = getSceneSize();
  const maxX = Math.max(0, width - elephantWidth);
  const maxY = Math.max(0, height - elephantHeight);
  const x = Math.random() * maxX;
  const y = Math.random() * maxY;

  element.style.left = `${x}px`;
  element.style.top = `${y}px`;
}

function keepInsideViewport(element: HTMLImageElement): void {
  const currentX = parseFloat(element.style.left || "0");
  const currentY = parseFloat(element.style.top || "0");
  const { width, height } = getSceneSize();
  const maxX = Math.max(0, width - elephantWidth);
  const maxY = Math.max(0, height - elephantHeight);

  element.style.left = `${Math.min(currentX, maxX)}px`;
  element.style.top = `${Math.min(currentY, maxY)}px`;
}

function startDisappearing(allElephants: Elephant[]): void {
  const runId = activeRunId;
  const remaining = [...allElephants];
  const shrinkDurationMs = getShrinkDurationMs();

  const runNext = (): void => {
    if (runId !== activeRunId) {
      return;
    }

    if (remaining.length === 0) {
      restartButton.classList.add("is-visible");
      return;
    }

    const current = remaining.pop();

    if (!current) {
      return;
    }

    current.element.classList.add("shrinking");

    window.setTimeout(() => {
      if (runId !== activeRunId) {
        return;
      }

      current.element.remove();
      runNext();
    }, shrinkDurationMs);
  };

  runNext();
}

function resetScene(): void {
  activeRunId += 1;
  restartButton.classList.remove("is-visible");
  scene.style.setProperty("--shrink-duration", `${getShrinkDurationMs()}ms`);

  for (const elephant of elephants) {
    elephant.element.remove();
  }

  elephants = [];

  for (let index = 0; index < TOTAL_ELEPHANTS; index += 1) {
    const elephant = document.createElement("img");
    elephant.className = "elephant";
    elephant.src = ELEPHANT_IMAGE_PATH;
    elephant.alt = `Elefant ${index + 1}`;
    elephant.width = elephantWidth;
    elephant.height = elephantHeight;
    elephant.style.zIndex = `${index + 1}`;

    placeRandomly(elephant);
    scene.append(elephant);
    elephants.push({ id: index, element: elephant });
  }

  startDisappearing(elephants);
}

async function initialize(): Promise<void> {
  const size = await getElephantImageSize(ELEPHANT_IMAGE_PATH);
  baseElephantWidth = size.width;
  baseElephantHeight = size.height;
  updateElephantSizeForViewport();
  setSelectedDurationButton(DURATION_OPTIONS_MINUTES[0]);
  resetScene();
}

function updateElephantSizeForViewport(): void {
  const { width, height } = getSceneSize();
  const scale = getElephantScale(width, height);
  elephantWidth = Math.max(36, Math.round(baseElephantWidth * scale));
  elephantHeight = Math.max(36, Math.round(baseElephantHeight * scale));
}

function getSceneSize(): { width: number; height: number } {
  const width = scene.clientWidth || window.innerWidth;
  const height = scene.clientHeight || window.innerHeight;
  return { width, height };
}

function getElephantScale(
  viewportWidth: number,
  viewportHeight: number,
): number {
  const shortestSide = Math.min(viewportWidth, viewportHeight);
  const isLandscape = viewportWidth >= viewportHeight;

  if (viewportWidth >= 1200) {
    return 1;
  }

  if (shortestSide >= 1024) {
    return isLandscape ? 0.95 : 0.92;
  }

  if (shortestSide >= 900) {
    return isLandscape ? 0.93 : 0.9;
  }

  if (shortestSide >= 768) {
    return isLandscape ? 0.9 : 0.86;
  }

  if (shortestSide >= 600) {
    return isLandscape ? 0.8 : 0.76;
  }

  if (shortestSide >= 480) {
    return 0.68;
  }

  return 0.58;
}

function getShrinkDurationMs(): number {
  return selectedTotalDurationMs / TOTAL_ELEPHANTS;
}

function setSelectedDurationButton(minutes: number): void {
  const buttons =
    durationControls.querySelectorAll<HTMLButtonElement>(".duration-button");

  for (const button of buttons) {
    const isActive = button.dataset.minutes === `${minutes}`;
    button.classList.toggle("is-active", isActive);
  }
}

function getElephantImageSize(
  src: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const image = new Image();

    image.onload = () => {
      const width = image.naturalWidth || FALLBACK_SIZE;
      const height = image.naturalHeight || FALLBACK_SIZE;
      resolve({ width, height });
    };

    image.onerror = () => {
      resolve({ width: FALLBACK_SIZE, height: FALLBACK_SIZE });
    };

    image.src = src;
  });
}
