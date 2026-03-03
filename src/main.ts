import './style.css';
import { registerSW } from 'virtual:pwa-register';

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
  2: assetPath('eier2min.png'),
  4: assetPath('eier4min.png'),
  6: assetPath('eier6min.png'),
};
const ELEPHANT_IMAGE_DEFAULT_PATH = assetPath('elephant.gif');
const ELEPHANT_IMAGE_ALT_PATH = assetPath('elephant7.gif');
const FALLBACK_SIZE = 120;

registerSW({ immediate: true });

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App container #app not found');
}

const scene = document.createElement('div');
scene.className = 'scene';
app.append(scene);

const infoContainer = document.createElement('div');
infoContainer.className = 'info';

const infoButton = document.createElement('button');
infoButton.className = 'info-button';
infoButton.type = 'button';
infoButton.setAttribute('aria-label', 'Installationshinweise anzeigen');
infoButton.textContent = 'i';

const infoButtonWrap = document.createElement('div');
infoButtonWrap.className = 'info-button-wrap';

const remainingTimeLabel = document.createElement('span');
remainingTimeLabel.className = 'remaining-time';
remainingTimeLabel.textContent = '00:00';

const elephantToggleButton = document.createElement('button');
elephantToggleButton.className = 'elephant-toggle';
elephantToggleButton.type = 'button';
elephantToggleButton.setAttribute(
  'aria-label',
  'Zwischen Elefanten-Bildern wechseln',
);
elephantToggleButton.setAttribute('role', 'switch');
elephantToggleButton.setAttribute('aria-checked', 'false');

const infoTooltip = document.createElement('div');
infoTooltip.className = 'info-tooltip';
infoTooltip.innerHTML =
  '<strong>Eieruhr als PWA installieren</strong><br><br>' +
  'iOS (Safari): Teilen → Zum Home-Bildschirm → Hinzufügen.<br><br>' +
  'Android (Chrome): App installieren oder Zum Startbildschirm hinzufügen.<br><br>' +
  'So funktioniert die Eieruhr auch ohne Internetverbindung und kann z.B. als Eieruhr in der Küche genutzt werden.<br><br>' +
  "Copyright (c) 2026 die.internauten.ch - Siehe <a href='https://github.com/internauten/ElephantsStompede' target='_blank' rel='noopener'>https://github.com/internauten/ElephantsStompede</a> für weitere Informationen, Quelltext und Lizenzinformationen.";

infoButtonWrap.append(infoButton, infoTooltip);
infoContainer.append(infoButtonWrap, remainingTimeLabel, elephantToggleButton);
scene.append(infoContainer);

const durationControls = document.createElement('div');
durationControls.className = 'duration-controls';
scene.append(durationControls);

let selectedTotalDurationMs = DURATION_OPTIONS_MINUTES[0] * MINUTE_MS;

for (const minutes of DURATION_OPTIONS_MINUTES) {
  const durationButton = document.createElement('button');
  durationButton.className = 'duration-button';
  durationButton.type = 'button';
  durationButton.dataset.minutes = `${minutes}`;

  const icon = document.createElement('img');
  icon.className = 'duration-button-icon';
  icon.src = DURATION_IMAGE_BY_MINUTES[minutes];
  icon.alt = '';
  icon.setAttribute('aria-hidden', 'true');

  const label = document.createElement('span');
  label.className = 'duration-button-label';
  label.textContent = `${minutes} Min.`;

  durationButton.append(icon, label);

  durationButton.addEventListener('click', () => {
    selectedTotalDurationMs = minutes * MINUTE_MS;
    setSelectedDurationButton(minutes);
    resetScene();
  });

  durationControls.append(durationButton);
}

const restartButton = document.createElement('button');
restartButton.className = 'restart-button';
restartButton.type = 'button';
restartButton.textContent = 'Neu starten';
scene.append(restartButton);

let elephants: Elephant[] = [];
let activeRunId = 0;
let baseElephantWidth = FALLBACK_SIZE;
let baseElephantHeight = FALLBACK_SIZE;
let elephantWidth = FALLBACK_SIZE;
let elephantHeight = FALLBACK_SIZE;
let countdownEndAt = 0;
let countdownIntervalId: number | null = null;
let selectedElephantImagePath = ELEPHANT_IMAGE_DEFAULT_PATH;
let isAltElephantSelected = false;

void initialize();

restartButton.addEventListener('click', () => {
  resetScene();
});

elephantToggleButton.addEventListener('click', () => {
  void toggleElephantVariant();
});

window.addEventListener('resize', () => {
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

function placeRandomlyInTopThird(element: HTMLImageElement): void {
  const { width, height } = getSceneSize();
  const maxX = Math.max(0, width - elephantWidth);
  const topThirdHeight = height / 3;
  const maxTopThirdY = Math.max(0, topThirdHeight - elephantHeight);
  const x = Math.random() * maxX;
  const y = Math.random() * maxTopThirdY;

  element.style.left = `${x}px`;
  element.style.top = `${y}px`;
}

function keepInsideViewport(element: HTMLImageElement): void {
  const currentX = parseFloat(element.style.left || '0');
  const currentY = parseFloat(element.style.top || '0');
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
      stopCountdown();
      setRemainingTime(0);
      restartButton.classList.add('is-visible');
      return;
    }

    const current = remaining.pop();

    if (!current) {
      return;
    }

    window.requestAnimationFrame(() => {
      if (runId !== activeRunId) {
        return;
      }

      current.element.classList.add('shrinking');

      window.setTimeout(() => {
        if (runId !== activeRunId) {
          return;
        }

        current.element.remove();
        runNext();
      }, shrinkDurationMs);
    });
  };

  runNext();
}

function resetScene(): void {
  activeRunId += 1;
  startCountdown();
  restartButton.classList.remove('is-visible');
  scene.style.setProperty('--shrink-duration', `${getShrinkDurationMs()}ms`);

  for (const elephant of elephants) {
    elephant.element.remove();
  }

  elephants = [];
  const guaranteedTopCount = Math.random() < 0.5 ? 1 : 2;
  const topThirdIndices = new Set<number>();

  while (topThirdIndices.size < guaranteedTopCount) {
    const randomIndex = Math.floor(Math.random() * TOTAL_ELEPHANTS);
    topThirdIndices.add(randomIndex);
  }

  for (let index = 0; index < TOTAL_ELEPHANTS; index += 1) {
    const elephant = document.createElement('img');
    elephant.className = 'elephant';
    elephant.src = selectedElephantImagePath;
    elephant.alt = `Elefant ${index + 1}`;
    elephant.width = elephantWidth;
    elephant.height = elephantHeight;
    elephant.style.zIndex = `${index + 1}`;

    if (topThirdIndices.has(index)) {
      placeRandomlyInTopThird(elephant);
    } else {
      placeRandomly(elephant);
    }
    scene.append(elephant);
    elephants.push({ id: index, element: elephant });
  }

  startDisappearing(elephants);
}

function startCountdown(): void {
  countdownEndAt = Date.now() + selectedTotalDurationMs;
  setRemainingTime(selectedTotalDurationMs);
  stopCountdown();

  countdownIntervalId = window.setInterval(() => {
    const remainingMs = Math.max(0, countdownEndAt - Date.now());
    setRemainingTime(remainingMs);

    if (remainingMs === 0) {
      stopCountdown();
    }
  }, 250);
}

function stopCountdown(): void {
  if (countdownIntervalId === null) {
    return;
  }

  window.clearInterval(countdownIntervalId);
  countdownIntervalId = null;
}

function setRemainingTime(remainingMs: number): void {
  remainingTimeLabel.textContent = formatRemainingTime(remainingMs);
}

function formatRemainingTime(remainingMs: number): string {
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');
  return `${paddedMinutes}:${paddedSeconds}`;
}

async function initialize(): Promise<void> {
  const size = await getElephantImageSize(selectedElephantImagePath);
  baseElephantWidth = size.width;
  baseElephantHeight = size.height;
  updateElephantSizeForViewport();
  setSelectedDurationButton(DURATION_OPTIONS_MINUTES[0]);
  resetScene();
}

async function toggleElephantVariant(): Promise<void> {
  isAltElephantSelected = !isAltElephantSelected;
  selectedElephantImagePath = isAltElephantSelected
    ? ELEPHANT_IMAGE_ALT_PATH
    : ELEPHANT_IMAGE_DEFAULT_PATH;

  elephantToggleButton.classList.toggle('is-alt', isAltElephantSelected);
  elephantToggleButton.setAttribute(
    'aria-checked',
    isAltElephantSelected ? 'true' : 'false',
  );

  const size = await getElephantImageSize(selectedElephantImagePath);
  baseElephantWidth = size.width;
  baseElephantHeight = size.height;
  updateElephantSizeForViewport();
  resetScene();
}

function updateElephantSizeForViewport(): void {
  const { width, height } = getSceneSize();
  const scale = getElephantScale(width, height);
  elephantWidth = Math.max(24, Math.round(baseElephantWidth * scale));
  elephantHeight = Math.max(24, Math.round(baseElephantHeight * scale));
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
    return isLandscape ? 0.75 : 0.7;
  }

  if (shortestSide >= 480) {
    return 0.58;
  }

  return 0.48;
}

function getShrinkDurationMs(): number {
  return selectedTotalDurationMs / TOTAL_ELEPHANTS;
}

function setSelectedDurationButton(minutes: number): void {
  const buttons =
    durationControls.querySelectorAll<HTMLButtonElement>('.duration-button');

  for (const button of buttons) {
    const isActive = button.dataset.minutes === `${minutes}`;
    button.classList.toggle('is-active', isActive);
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
