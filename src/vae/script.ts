import { MusicRNN, MusicVAE } from "@magenta/music/esm";
import type { SynthOptions } from "tone";
import type { RecursivePartial } from "tone/build/esm/core/util/Interface";
import { Board, type Cell, NoiseyMakey } from "./helpers";

let isMouseDown = false;
let isAnimating = false;
let animationSpeed = 100;

/*
Magenta.js has 2 models we can use: 
  - an RNN (recurrent neural network)
  - a VAE (variational auto-encoder)
They both generate sequences of music based on an input,
but in slightly different ways.
*/
let useRNN = false;
let forceInputToDrums = true;

let noiseyMakey: NoiseyMakey;
let board: Board;

// The RNN is a recurrent neural network:
// We use it to give it an initial sequence of music, and
// it continues playing to match that!
let model: MusicRNN | MusicVAE;
let model_checkpointURL: string;

export function initialize(elm: Element) {
  if (elm) {
    init();
  }
}

function init() {
  noiseyMakey = noiseyMakey || new NoiseyMakey();
  board = board || new Board();

  const tElm = document.querySelector("#inputLabel span");
  if (!tElm?.querySelector("span input")) {
    tElm?.insertAdjacentHTML(
      "afterbegin",
      '<input placeholder="100" type = "number" value = "100" id = "input" /> ',
    );
  }

  // If there is a location, parse it.
  if (window.location.hash) {
    try {
      const hash = window.location.hash.slice(1);
      const parsed = hash.split("&");
      board.data = decode(parsed[0]);
      const elm = document.getElementById("input") as HTMLInputElement;
      if (parsed[1] && elm) {
        elm.value = parsed[1];
        animationSpeed = Number.parseInt(parsed[1]);
      }
      board.draw();
    } catch (err) {
      window.location.hash = "not-a-valid-pattern-url";
    }
  }

  // Set up event listeners.
  document
    .getElementById("container")
    ?.addEventListener("mousedown", (event) => {
      isMouseDown = true;
      clickCell(event);
    });
  document.getElementById("container")?.addEventListener("mouseup", () => {
    isMouseDown = false;
    return isMouseDown;
  });
  document
    .getElementById("container")
    ?.addEventListener("mouseover", clickCell);
  document
    .getElementById("input")
    ?.addEventListener("change", (event: Event) => {
      if (event.target instanceof HTMLInputElement) {
        const target = event.target;
        animationSpeed = Number.parseInt(target.value);
        updateLocation();
      }
    });
  const modelNameElm = document.getElementById("modelName") as HTMLInputElement;
  document.getElementById("radioRnn")?.addEventListener("click", (event) => {
    useRNN = (event.target as HTMLInputElement).checked;
    if (modelNameElm) {
      modelNameElm.value = "drum_kit_rnn";
    }
    document.getElementById("radioForceDrumNo")?.click();
  });
  document.getElementById("radioVae")?.addEventListener("click", (event) => {
    useRNN = !(event.target as HTMLInputElement).checked;
    if (modelNameElm) {
      modelNameElm.value = "drums_2bar_lokl_small";
    }
    document.getElementById("radioForceDrumYes")?.click();
  });
  document
    .getElementById("radioForceDrumYes")
    ?.addEventListener("click", (event) => {
      forceInputToDrums = (event.target as HTMLInputElement).checked;
    });
  document
    .getElementById("radioForceDrumNo")
    ?.addEventListener("click", (event) => {
      forceInputToDrums = !(event.target as HTMLInputElement).checked;
    });

  // Secret keys! (not so secret)
  document.body.addEventListener("keypress", (event) => {
    switch (event.keyCode) {
      case 115: // s
        playSynth();
        break;
      case 100: // d
        playDrums();
        break;
      case 112: // p
        playOrPause();
        break;
      case 105: // i
        autoDrums();
        break;
      case 109: // m
        showSettings();
        break;
    }
  });
}

export function reset(clearLocation = false) {
  board.reset();
  if (clearLocation) {
    window.location.hash = "";
  }
}

function clickCell(event: Event) {
  const button = event.target as HTMLButtonElement;

  // We only care about clicking on the buttons, not the container itself.
  if (button.localName !== "button" || !isMouseDown) {
    return;
  }

  const x = Number.parseInt(button.dataset.row ?? "0");
  const y = Number.parseInt(button.dataset.col ?? "0");
  board.toggleCell(x, y, noiseyMakey.getSound(), button);

  updateLocation();
}

function animate() {
  let currentColumn = 0;
  const animationIndex = setTimeout(step, animationSpeed);

  // const rows = document.querySelectorAll('.container > .row');

  // An animation step.
  function step() {
    // Draw the board at this step.
    board.animate(currentColumn, noiseyMakey);

    // Get ready for the next column.
    currentColumn++;
    if (currentColumn === 16) {
      currentColumn = 0;
    }

    // Did we get paused mid step?
    if (isAnimating) {
      setTimeout(step, animationSpeed);
    } else {
      clearTimeout(animationIndex);
      currentColumn = 0;
      board.clearAnimation();
    }
  }
}

/***********************************
 * Sample demos
 ***********************************/
export function loadDemo(which: number) {
  switch (which) {
    case 1:
      board.data = decode(
        "0000000000000000000000000000000022222000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000200020002000200000000000000000000000000000000000000000101000000000000001010101010010000010101010",
      );
      break;
    case 2:
      board.data = decode(
        "0000000000000000000000000000000000000000000000000000011001100000000001100110000000020000000020000002000000002000000020000002000000000222222000000000000000000000001000010000000000100000001101100011100100121210001010010001210000101001000010000000000000000000",
      );
      break;
    case 3:
      board.data = decode(
        "2222220001001000000000000000000000222222020220220000000000000000000000110000000000001000000000000001000000010000000000000000000000000000000010000010000000000000010000000000000001000000000010000100000000000000000000000000100000000000000000000000010101010000",
      );
      break;
    case 4:
      board.data = decode(
        "2202020202202020000020000020200000202002200220220002002000020001200000220021020000010000000000000000000100000000101010101010101000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000&100",
      );
      break;
    case 5:
      board.data = decode(
        "0000000000000000000111100000000000000000000000000011111000000000000010000000000000010000010000000010000001000000000000000100000000000000100000000000001100000000000000000010010000000000001001000000000000100100000000000000010000000000000010000000000000000000",
      );
      break;
  }
  updateLocation();
  board.draw();
}

/***********************************
 * UI actions
 ***********************************/
export function updateSynth(option: RecursivePartial<SynthOptions>) {
  noiseyMakey.updateSynth(option);
}

export function playOrPause() {
  const container = document.getElementById("container");

  if (isAnimating) {
    container?.classList.remove("playing");
    noiseyMakey.pause();
  } else {
    container?.classList.add("playing");
    animate();
    noiseyMakey.play();
  }

  isAnimating = !isAnimating;
  (document.getElementById("btnPlay") as HTMLElement).textContent = isAnimating
    ? "Pause"
    : "Play!";
}

export function playSynth() {
  noiseyMakey.isSynth = true;
  document.getElementById("btnSynth")?.classList.add("synth");
  document.getElementById("btnDrums")?.classList.remove("drums");
}

export function playDrums() {
  noiseyMakey.isSynth = false;
  document.getElementById("btnSynth")?.classList.remove("synth");
  document.getElementById("btnDrums")?.classList.add("drums");
}

export function showHelp() {
  const box = document.getElementById("help");
  if (box) {
    box.hidden = !box.hidden;
  }
}

export function showSettings() {
  const box = document.getElementById("settings");
  if (!box) {
    return;
  }
  // If we're closing this, also re-initialize the model if needed
  if (!box.hidden) {
    loadModel();
  }
  box.hidden = !box.hidden;
}

export function autoDrums() {
  const btn = document.getElementById("btnAuto");
  if (!btn) {
    return;
  }

  // Load the magenta model if we haven't already.
  if (btn.classList.contains("not-loaded")) {
    loadModel();
  } else {
    btn.setAttribute("disabled", "true");

    // Don't block the UI thread while this is happening.
    setTimeout(() => {
      if (useRNN) {
        const sequence = board.getSynthSequence(forceInputToDrums);

        // High temperature to get interesting beats!
        (model as MusicRNN)
          .continueSequence(sequence, 16, 1.3)
          .then((dream) => {
            board.drawDreamSequence(dream, sequence);
            updateLocation();
            btn.removeAttribute("disabled");
          });
      } else {
        const sequence = board.getSynthSequence(forceInputToDrums);
        const vae = model as MusicVAE;
        // TODO: use async/await here omg.
        vae.encode([sequence]).then((encoded) => {
          vae.decode(encoded).then((decoded) => {
            board.drawDreamSequence(decoded[0], sequence);

            updateLocation();
            btn.removeAttribute("disabled");
          });
        });

        // Example: This generates a random sequence all the time:
        // model.sample(1).then((dreams) => {...});
      }
    });
  }
}

function loadModel() {
  const btn = document.getElementById("btnAuto");
  if (!btn) {
    return;
  }

  btn.classList.toggle("not-loaded", true);
  btn.textContent = "Loading...";
  btn.setAttribute("disabled", "true");

  const name = (
    document.getElementById("modelName") as HTMLInputElement
  ).value.trim();
  const root = useRNN ? "music_rnn" : "music_vae";

  const url = `https://storage.googleapis.com/magentadata/js/checkpoints/${root}/${name}`;

  if (!model || model_checkpointURL !== url) {
    model = useRNN ? new MusicRNN(url) : new MusicVAE(url);
    model_checkpointURL = url;
  }

  Promise.all([model.initialize()]).then((/*[vars]*/) => {
    const btn = document.getElementById("btnAuto");
    if (!btn) {
      return;
    }
    btn.classList.toggle("not-loaded", false);
    btn.removeAttribute("disabled");
    btn.textContent = "Improvise!";
  });
}

/***********************************
 * Save and load application state
 ***********************************/
function updateLocation() {
  // New board state, so update the URL.
  const speed = Number.parseInt(
    (document.getElementById("input") as HTMLInputElement).value,
  );
  const newHash = `#${encode(board.data)}&${speed}`;
  if (newHash !== window.location.hash) {
    window.location.hash = newHash;
  }
}

function encode(arr: Cell[][]) {
  let bits = "";
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 16; j++) {
      bits += arr[i][j].on ? arr[i][j].on : 0;
    }
  }
  return bits;
}

function decode(bits: string): Cell[][] {
  const arr = [];
  for (let i = 0; i < 16; i++) {
    const row: Cell[] = [];
    arr.push(row);
    for (let j = 0; j < 16; j++) {
      arr[i][j] = {};
      const c = bits.charAt(i * 16 + j);
      if (c !== "0") {
        arr[i][j].on = Number.parseInt(c);
      }
    }
  }
  return arr;
}
