import { INoteSequence, Player } from "@magenta/music";
import * as Tone from "tone";

export type Cell = {
  on?: number;
};

type Note = {
  pitch: number;
  quantizedStartStep: number;
  isDrum: boolean;
  quantizedEndStep: number;
};

type Ripple = {
  x: number;
  y: number;
  distance: number;
  sound: number;
};

type Sequence = {
  notes: Note[];
  quantizationInfo: { stepsPerQuarter: number };
};

/***********************************
 * Makes synth or drum noises
 ***********************************/
export class NoiseyMakey {
  synth: Tone.PolySynth;
  wham: Tone.PolySynth;
  isSynth: boolean;
  synthSounds: string[];
  magentaPlayer: Player;
  magentaPitches: number[];
  constructor() {
    this.synth = this._makeASynth();
    this.wham = this._makeAWham();

    this.isSynth = true;
    this.synthSounds = [
      "B4",
      "A4",
      "G4",
      "F4",
      "E4",
      "D4",
      "C4",
      "B3",
      "A3",
      "G3",
      "F3",
      "E3",
      "D3",
      "C3",
      "B2",
      "A2",
      "G2",
      "F2",
    ];

    this.magentaPlayer = new Player();

    // Some magenta drums are too loud.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.magentaPlayer.drumKit.kick.volume.value = -3;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.magentaPlayer.drumKit.snare.volume.value = -10;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.magentaPlayer.drumKit.openHihat.volume.value = -10;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.magentaPlayer.drumKit.crash.volume.value = -6;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.magentaPlayer.drumKit.ride.volume.value = -6;

    // From https://github.com/tensorflow/magenta-js/blob/master/music/src/core/data.ts#L35
    this.magentaPitches = [
      36, 38, 42, 46, 45, 48, 50, 49, 51, /*repeat*/ 35, 27, 29, 47, 30, 52, 44,
    ];

    // TODO: someone help me make a clap, please :sob:
    //const envelope = {attack: 0, decay: 2, sustain: 0.05, release: 0, attackCurve: 'exponential'};
    //const clap = new Tone.NoiseSynth({noise:{type:'white'},envelope}).toMaster();
  }

  play() {
    Tone.context.resume();
    Tone.Transport.start();
  }

  pause() {
    Tone.Transport.pause();
  }

  // Whether we are currently on to play a drum or a synth
  getSound() {
    return this.isSynth ? 1 : 2;
  }

  // Play specific sounds.
  // TODO: should probably use magenta's synth for this, maybe:
  // this.magentaPlayer.playNote({startTime: which, endTime: which + 1, pitch: 35, velocity: 100, isDrum: false}, '16n');
  playSynth(which: number) {
    this.synth.triggerAttackRelease(this.synthSounds[which], "16n");
  }

  playDrum(which: number) {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.magentaPlayer.drumKit.playNote(this.magentaPitches[which]);
    } catch (e) {
      console.error(e);
    }
  }

  _makeASynth(): Tone.PolySynth {
    // Set up tone.
    // FIXME: 16 voices
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    return synth;
  }

  _makeAWham(): Tone.PolySynth {
    // FIXME: 4 voices
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    synth.set({
      oscillator: {
        type: "fatsawtooth",
        count: 3,
        spread: 30,
      },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.5,
        release: 0.4,
        attackCurve: "exponential",
      },
    });
    return synth;
  }
}

/***********************************
 * Board of dots
 ***********************************/
export class Board {
  data: Cell[][];
  ripples: Ripple[];
  ui: {
    container: HTMLElement | null;
    rows: NodeListOf<HTMLElement> | undefined;
  };
  isPlaying: boolean;
  constructor() {
    this.data = [];
    this.ripples = [];
    this.ui = {
      container: null,
      rows: undefined,
    }; // gets populated by this.reset();

    this.reset();

    this.isPlaying = false;
  }

  reset() {
    this.data = [];
    this.ui.container = document.getElementById("container");
    if (this.ui.container) {
      this.ui.container.innerHTML = "";

      for (let i = 0; i < 16; i++) {
        this.data.push([]);
        const rowEl = document.createElement("div");
        rowEl.classList.add("row");
        this.ui.container.appendChild(rowEl);

        for (let j = 0; j < 16; j++) {
          this.data[i][j] = {};
          const button = document.createElement("button");
          button.setAttribute("aria-label", "cell, empty");
          button.classList.add("pixel");
          button.dataset.row = i.toString();
          button.dataset.col = j.toString();
          rowEl.appendChild(button);
        }
      }
    }
    this.ui.rows = document.querySelectorAll(".container > .row");
    this.draw();
  }

  // Toggles a particular dot from on to off.
  toggleCell(i: number, j: number, sound: number, uiButton: HTMLElement) {
    const dot = this.data[i][j];
    if (dot.on) {
      dot.on = 0;
    } else {
      dot.on = sound;
    }

    uiButton.setAttribute(
      "aria-label",
      sound === 1 ? "cell, synth" : "cell, drums"
    );
    this.draw();
  }

  // Take the toggled synth notes so that Magenta can dream up some drums.
  getSynthSequence(forceToDrum = false) {
    const sequence: Sequence = {
      notes: [] as Note[],
      quantizationInfo: { stepsPerQuarter: 4 },
    };

    const drumPitches = [
      36, 38, 42, 46, 45, 48, 50, 49, 51, 35, 27, 29, 47, 55, 52, 44,
    ];
    for (let i = 0; i < 16; i++) {
      for (let j = 0; j < 16; j++) {
        // Found a synth note!
        if (this.data[i][j].on === 1) {
          sequence.notes.push({
            pitch: drumPitches[i],
            quantizedStartStep: j,
            isDrum: forceToDrum ? true : false,
            quantizedEndStep: j + 1,
          });
        }

        // If it's a drum note, delete it pre-emptive-ly.
        if (this.data[i][j].on === 2) {
          this.data[i][j].on = 0;
        }
      }
    }

    return sequence;
  }

  drawDreamSequence(sequence: INoteSequence, originalSequence: Sequence) {
    if (
      JSON.stringify(sequence.notes) === JSON.stringify(originalSequence.notes)
    ) {
      console.log("Something mysterious went wrong, bailing");
    }

    const drumPitches = [
      36, 38, 42, 46, 45, 48, 50, 49, 51, 35, 27, 29, 47, 55, 52, 44,
    ];

    const numOtherPitches = 7;
    for (let i = 0; sequence.notes && i < sequence.notes.length; i++) {
      // A note is an object like this: {pitch: 36, quantizedStartStep: 1, quantizedEndStep: 2, isDrum: true}

      const note = sequence.notes[i];
      const col = note.quantizedStartStep ?? 0;

      // If the song is longer than what we've got, skip it.
      if (col >= 16) {
        continue;
      }

      // Only play the drums generated by the VAE.
      if (note.isDrum) {
        // Note: I've noticed that the RNN model always returns the base pitches, so one of the 0-9 pitches
        // This means that we'd never generate any random sounds on the bottom of the board, so
        // flip a coin and sometimes randomly, pick from the bottom sounds for the same kind of drum.
        // You know, keep it interesting.
        let row = drumPitches.indexOf(note.pitch ?? 0);
        console.log(note.pitch, row);
        if (row < numOtherPitches && Math.random() < 0.5) {
          row += numOtherPitches;
        }

        if (row !== -1) {
          // Don't draw on top of a synth tho
          if (this.data[row][col].on !== 1) {
            this.data[row][col].on = 2;
          }
        }
      }
    }
    this.draw();
  }

  // Paints the current state of the world.
  draw() {
    this._updateRipples();

    if (!this.ui?.rows) {
      return;
    }
    for (let i = 0; i < 16; i++) {
      const pixels = this.ui.rows[i].querySelectorAll(".pixel");

      for (let j = 0; j < 16; j++) {
        // Maybe it's a sound?
        if (this._paintSoundCell(this.data[i][j], pixels[j])) {
          continue;
        }
        // Maybe it's part of a ripple?
        this._paintRippleCell(pixels[j], i, j);
      }
    }
  }

  animate(currentColumn: number, noiseyMakey: NoiseyMakey) {
    if (!this.ui?.rows) {
      return;
    }
    for (let i = 0; i < 16; i++) {
      const pixels = this.ui.rows[i].querySelectorAll(".pixel");
      this._clearPreviousAnimation(pixels);

      // On the current column any cell can either be:
      // - a sound we need to make
      // - empty, in which case we paint the green time bar.

      // Is the current cell at this time a sound?
      const sound = this.data[i][currentColumn].on;
      if (sound) {
        // Start a ripple from here!
        this.ripples.push({
          x: i,
          y: currentColumn,
          distance: 0,
          sound: sound,
        });

        // It's a note getting struck.
        pixels[currentColumn].classList.add("active");

        // Play the note.
        if (sound === 1) {
          noiseyMakey.playSynth(i);
        } else {
          noiseyMakey.playDrum(i);
        }
      } else {
        // It's not a sound, it is a time bar.
        pixels[currentColumn].classList.add("bar");
      }
    }
    this.draw();
  }

  // Remove animation artifacts like the green bar line and the ripples.
  clearAnimation() {
    this.ripples = [];
    if (!this.ui?.container) {
      return;
    }
    const bars = this.ui.container.querySelectorAll(".bar");
    const rips = this.ui.container.querySelectorAll(".ripple");
    const actives = this.ui.container.querySelectorAll(".active");

    for (const bar of bars) {
      bar.classList.remove("bar");
    }
    for (const rip of rips) {
      rip.classList.remove("ripple");
    }
    for (const active of actives) {
      active.classList.remove("active");
    }
  }

  _clearPreviousAnimation(row: NodeListOf<Element>) {
    for (let j = 0; j < 16; j++) {
      row[j].classList.remove("bar");
      row[j].classList.remove("active");
    }
  }

  _updateRipples() {
    for (let i = 0; i < this.ripples.length; i++) {
      // If the ripples it too big, nuke it.
      if (this.ripples[i].distance > 6) {
        this.ripples.splice(i, 1);
      } else {
        this.ripples[i].distance += 1;
      }
    }
  }

  // Displays the right sound on a UI cell, if it's on.
  _paintSoundCell(dataCell: Cell, uiCell: Element) {
    let didIt = false;
    if (dataCell.on) {
      uiCell.classList.add("on");

      // You may have clicked on this when it was part of a ripple.
      uiCell.classList.remove("ripple");

      // Display the correct sound.
      uiCell.classList.remove("drums");
      uiCell.classList.remove("synth");
      uiCell.classList.add(dataCell.on === 1 ? "synth" : "drums");
      didIt = true;
    } else {
      uiCell.classList.remove("on");
    }
    return didIt;
  }

  _paintRippleCell(uiCell: Element, i: number, j: number) {
    // Clear the old ripple, if it exists.
    uiCell.classList.remove("ripple");

    // Is this pixel inside a ripple?
    for (let r = 0; r < this.ripples.length; r++) {
      const ripple = this.ripples[r];

      // Math. We basically want to draw a donut around the ripple center.
      // A distance is sqrt[(x1-x2)^2 + (y1-y2)^2]
      const distanceFromRippleCenter = Math.sqrt(
        (i - ripple.x) * (i - ripple.x) + (j - ripple.y) * (j - ripple.y)
      );

      // If you're in this magical donut with magical numbers I crafted
      // by hand, then congratulations: you're a ripple cell!
      if (
        distanceFromRippleCenter > ripple.distance - 0.7 &&
        distanceFromRippleCenter < ripple.distance + 0.7 &&
        distanceFromRippleCenter < 3.5
      ) {
        uiCell.classList.add("ripple");
        uiCell.classList.add(ripple.sound === 1 ? "synth" : "drums");
      }
    }
  }
}
