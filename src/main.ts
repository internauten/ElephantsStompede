import './style.css';
import { registerSW } from 'virtual:pwa-register';

type Elephant = {
  id: number;
  element: HTMLImageElement;
};

const TOTAL_ELEPHANTS = 20;
const SHRINK_DURATION_MS = 5_000;
const ELEPHANT_IMAGE_PATH = '/elephant.gif';
const FALLBACK_SIZE = 120;

registerSW({ immediate: true });

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App container #app not found');
}

const scene = document.createElement('div');
scene.className = 'scene';
scene.style.setProperty('--shrink-duration', `${SHRINK_DURATION_MS}ms`);
app.append(scene);

const restartButton = document.createElement('button');
restartButton.className = 'restart-button';
restartButton.type = 'button';
restartButton.textContent = 'Neu starten';
scene.append(restartButton);

let elephants: Elephant[] = [];
let activeRunId = 0;
let elephantWidth = FALLBACK_SIZE;
let elephantHeight = FALLBACK_SIZE;

void initialize();

restartButton.addEventListener('click', () => {
  resetScene();
});

window.addEventListener('resize', () => {
  for (const elephant of elephants) {
    if (elephant.element.isConnected) {
      keepInsideViewport(elephant.element);
    }
  }
});

function placeRandomly(element: HTMLImageElement): void {
  const maxX = Math.max(0, window.innerWidth - elephantWidth);
  const maxY = Math.max(0, window.innerHeight - elephantHeight);
  const x = Math.random() * maxX;
  const y = Math.random() * maxY;

  element.style.left = `${x}px`;
  element.style.top = `${y}px`;
}

function keepInsideViewport(element: HTMLImageElement): void {
  const currentX = parseFloat(element.style.left || '0');
  const currentY = parseFloat(element.style.top || '0');
  const maxX = Math.max(0, window.innerWidth - elephantWidth);
  const maxY = Math.max(0, window.innerHeight - elephantHeight);

  element.style.left = `${Math.min(currentX, maxX)}px`;
  element.style.top = `${Math.min(currentY, maxY)}px`;
}

function startDisappearing(allElephants: Elephant[]): void {
  const runId = activeRunId;
  const remaining = [...allElephants];

  const runNext = (): void => {
    if (runId !== activeRunId) {
      return;
    }

    if (remaining.length === 0) {
      restartButton.classList.add('is-visible');
      return;
    }

    const current = remaining.pop();

    if (!current) {
      return;
    }

    current.element.classList.add('shrinking');

    window.setTimeout(() => {
      if (runId !== activeRunId) {
        return;
      }

      current.element.remove();
      runNext();
    }, SHRINK_DURATION_MS);
  };

  runNext();
}

function resetScene(): void {
  activeRunId += 1;
  restartButton.classList.remove('is-visible');

  for (const elephant of elephants) {
    elephant.element.remove();
  }

  elephants = [];

  for (let index = 0; index < TOTAL_ELEPHANTS; index += 1) {
    const elephant = document.createElement('img');
    elephant.className = 'elephant';
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
  elephantWidth = size.width;
  elephantHeight = size.height;
  resetScene();
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
