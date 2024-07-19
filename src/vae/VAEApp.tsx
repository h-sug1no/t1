import {
  autoDrums,
  initialize,
  loadDemo,
  playDrums,
  playOrPause,
  playSynth,
  reset,
  showHelp,
  showSettings,
} from "./script";

import "./styles.css";

export function VAEApp() {
  return (
    <div
      ref={(elm: HTMLDivElement) => {
        initialize(elm);
      }}
    >
      <h1>tenori-off</h1>

      <button
        className="controls glitcheroni synth"
        id="btnSynth"
        onClick={() => {
          playSynth();
        }}
        title="Adding synth sounds"
      >
        Synth
      </button>
      <button
        className="controls glitcheroni"
        id="btnDrums"
        onClick={() => {
          playDrums();
        }}
        title="Adding drum sounds"
      >
        Drums
      </button>
      <button
        className="controls glitcheroni not-loaded"
        onClick={() => {
          autoDrums();
        }}
        id="btnAuto"
        title="Improvise drums using Machine Learning"
      >
        Load ML(~10Mb) to Improvise
      </button>
      <br />
      <label id="inputLabel" className="controls glitcheroni">
        Step<span></span>ms
      </label>
      <button
        className="controls glitcheroni"
        id="btnPlay"
        onClick={() => {
          playOrPause();
        }}
      >
        Play!
      </button>
      <button
        className="controls glitcheroni"
        onClick={() => {
          reset(true);
        }}
      >
        Reset
      </button>
      <button
        className="controls glitcheroni"
        onClick={() => {
          showHelp();
        }}
        title="Help: Keys: s:synth, d:drum, p:Play/Pause i:Improvise, m:settings"
      >
        ?
      </button>
      <br />
      <br />

      <div className="dialog glitcheroni" id="help" hidden>
        <h2>What is this?</h2>
        <p>
          A 笨ｨ<a href="https://en.wikipedia.org/wiki/Tenori-on">Tenori-on</a>
          笨ｨ is a dope electronic music instrument sequencer thingie that
          Yamaha made for a hot minute. I love pixels and patterns and
          generating things out of pixels and patterns, which means I LOVE the
          Tenori-on. Since they're rare and mad{" "}
          <a href="https://reverb.com/item/11642149-yamaha-tenori-on">
            expensive
          </a>
          , I've never seen one, so I made a JavaScript version of what I think
          it looks like.
        </p>
        <p>
          You can change between <b>drums</b> or a <b>synth</b> sound (also
          using the <b>D</b> or <b>S</b> keys). The URL also holds the state, so
          you can send it to a pal to have them listen to your masterpiece. If
          you hit a bug, refreshing usually makes it go away.
        </p>
        <p>
          The <b>Improvise</b> button will auto generate drums to match your
          synth using ~*machine learning*~ via{" "}
          <a href="https://magenta.tensorflow.org/js">Magenta.js</a>
          and a recurrent neural network. In the browser!!
        </p>
        <p>Ok, go make fun shit now and tell me about it!</p>
        <button
          className="controls glitcheroni"
          onClick={() => {
            showHelp();
          }}
        >
          Ok I will!!
        </button>
        <p>
          (剌 thanks to <a href="https://twitter.com/holman">Zach</a>,{" "}
          <a href="https://twitter.com/dassurma">Surma</a> and
          <a href="https://twitter.com/kosamari">Mariko</a> for providing a
          sample!)
        </p>
      </div>

      <div className="dialog glitcheroni" id="settings" hidden>
        <h2>Magenta.js settings</h2>
        <br />
        <div>
          Use the: <br />
          <label className="radio">
            <input name="model" type="radio" id="radioRnn" />
            <span className="control-indicator glitcheroni"></span>
            RNN
          </label>
          <label className="radio">
            <input name="model" type="radio" id="radioVae" checked />
            <span className="control-indicator glitcheroni"></span>
            VAE
          </label>
          <br />
          <br />
          Feed the synth input as drums to the model (useful in the VAE
          drums_2bar_lokl_small, but not necessarily in the RNN model)
          <br />
          <label className="radio">
            <input name="drum" type="radio" id="radioForceDrumYes" checked />
            <span className="control-indicator glitcheroni"></span>
            Yes
          </label>
          <label className="radio">
            <input name="drum" type="radio" id="radioForceDrumNo" />
            <span className="control-indicator glitcheroni"></span>
            No
          </label>
          <br />
          <br />
          <label>
            Model name (from the list of{" "}
            <a href="https://goo.gl/magenta/js-checkpoints">checkpoint IDs</a>):
            <br />
            <input
              className="glitcheroni text"
              value="drums_2bar_lokl_small"
              id="modelName"
            />
          </label>
        </div>
        <br />
        <button
          className="controls glitcheroni"
          onClick={() => {
            showSettings();
          }}
        >
          Close and re-initialize
        </button>
      </div>

      <div className="container" id="container"></div>

      <br />

      <h3 className="samples">samples</h3>
      <button
        className="controls glitcheroni"
        onClick={() => {
          loadDemo(1);
        }}
      >
        1
      </button>
      <button
        className="controls glitcheroni"
        onClick={() => {
          loadDemo(2);
        }}
      >
        2
      </button>
      <button
        className="controls glitcheroni"
        onClick={() => {
          loadDemo(3);
        }}
      >
        3
      </button>
      <button
        className="controls glitcheroni"
        onClick={() => {
          loadDemo(4);
        }}
      >
        4
      </button>
      <button
        className="controls glitcheroni"
        onClick={() => {
          loadDemo(5);
        }}
      >
        5
      </button>

      {/*
            < !--include the Glitch button to show what the webpage is about and
            to make it easier for folks to view source and remix-- >
            */}
      <div
        className="glitchButton"
        style={{
          position: "fixed",
          top: "4px",
          right: "4px",
        }}
      ></div>
      {/*<script src="https://button.glitch.me/button.js"></script>*/}

      <footer>
        I have no idea what I'm doing, a{" "}
        <a href="https://twitter.com/notwaldorf">Meownica</a> production.
      </footer>
    </div>
  );
}

export default VAEApp;
