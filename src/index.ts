import LedFloodPanel150RGB8Channel from '@device/Stairville/LedFloodPanel150RGB8Channel';
import ArtNET from './ArtNET';
import { hsl2rgb } from './util';
import Microphone from 'Microphone';
import BeatDetector from 'BeatDetector';
import Gain from 'Gain';
import * as Speaker from 'speaker';
import EL230RGBMK2 from '@device/Laserworld/EL230RGBMK2';
import Spot60Prism from '@device/Light4Me/Movinghead/Spot60Prism';
import LittleboynyLaser from '@device/Littleboyny/Laser';
import CWWWA from '@device/Stairville/CWWWA';

process.title = "dmx-art-net@1.0.0";

let dmx = ArtNET.newSender({ net: 0, subnet: 0, universe: 0 });

dmx.reset();
// mh1   | mh2     | laser   | par1    | par2   
// 1 - 9 | 10 - 18 | 19 - 27 | 28 - 35  | 36 - 44

let mh1 = new Spot60Prism(dmx, 100);
let mh2 = new Spot60Prism(dmx, 109);
let laser = new EL230RGBMK2(dmx, 16);

let par1 = new LedFloodPanel150RGB8Channel(dmx, 0);
let par2 = new LedFloodPanel150RGB8Channel(dmx, 8);
let par3 = new LedFloodPanel150RGB8Channel(dmx, 49);
let par4 = new LedFloodPanel150RGB8Channel(dmx, 57);
let par5 = new LedFloodPanel150RGB8Channel(dmx, 65);

let strobe1 = new CWWWA(dmx, 73);
let strobe2 = new CWWWA(dmx, 78);

mh1.setStrobe(8);
//mh1.setStrobe(130);
mh1.setDimmer(255);
mh1.setPan(270);
mh2.setStrobe(8);
//mh2.setStrobe(130);
mh2.setDimmer(255);
mh2.setPan(360);

laser.setOn(true);
laser.setDynamic(true);
laser.setPettern(0);
laser.setX(255);
laser.setY(0);
laser.setScanSpeed(0);
laser.setPetternSpeed(0);
laser.setZoom(0);
laser.setColor(0);
laser.setColorSegment(0);

par1.setDimmer(128);
par2.setDimmer(128);
par3.setDimmer(128);
par4.setDimmer(128);
par5.setDimmer(128);

strobe1.setColor(255, 255, 255);
strobe1.setStrobe(255);
strobe2.setColor(255, 255, 255);
strobe2.setStrobe(255);

dmx.transmit();

let degres = 0;


let mhcolor = 0;
let lasercolor = 0;
let mhx = 0;
let mhy = 0;
let mhi = true;
let mhipan = false;
let mhay = true;
let mhax = false;
let panValue = 0;
let direction = 5;

setInterval(() => {
  degres = (degres + 5) % 360;
  par1.setColor(...hsl2rgb(degres, 1, 0.5));
  par2.setColor(...hsl2rgb(degres + 90, 1, 0.5));
  par3.setColor(...hsl2rgb(degres + 180, 1, 0.5));
  par4.setColor(...hsl2rgb(degres + 270, 1, 0.5));
  par5.setColor(...hsl2rgb(degres, 1, 0.5));
  
  if(Math.abs(panValue) >= 45)
    direction *= -1;
  panValue += direction;
  mh1.setPan(270 - panValue);
  mh2.setPan(360 - (mhipan ? -panValue : panValue));
  mh1.setTilt(mhy);
  mh2.setTilt(mhi ? 100 - mhy : mhy);
  mh1.setColor(mhcolor);
  mh2.setColor(mhcolor);

  laser.setColor(lasercolor);

  dmx.transmit();
}, 100);

const beat = (distance: number) => {
  degres = (degres + 180) % 360;
  mhcolor = (mhcolor + 1) % 8;
  lasercolor = (lasercolor + 1) % 7;
  console.log(distance);
};


let strobepars = false;
let strobemovingheads = false;
let strobewhite = false;

process.stdin.setRawMode(true);
process.stdin.on('data', (data) => {
  //console.log(data);
  if(data.at(0) == 0x0d) {
    // if (Math.abs(lastBeat - Date.now()) < 25) return; 
    // beat(Math.abs(lastBeat - Date.now())); lastBeat = Date.now();
  } else if(data.at(0) == 0x73) {
    strobepars = !strobepars;
    par1.setStrobe(!strobepars ? 0 : 250);
    par2.setStrobe(!strobepars ? 0 : 250);
    par3.setStrobe(!strobepars ? 0 : 250);
    par4.setStrobe(!strobepars ? 0 : 250);
    par5.setStrobe(!strobepars ? 0 : 250);
    dmx.transmit();
    console.log("strobe pars", strobepars);
  } else if(data.at(0) == 0x6d) {
    strobemovingheads = !strobemovingheads;
    mh1.setStrobe(!strobemovingheads ? 8 : 130);
    mh2.setStrobe(!strobemovingheads ? 8 : 130);
    dmx.transmit();
    console.log("strobe movingheads", strobemovingheads);
  } else if(data.at(0) == 0x77) {
    strobewhite = !strobewhite;
    strobe1.setDimmer(!strobewhite ? 0 : 255);
    strobe2.setDimmer(!strobewhite ? 0 : 255);
    dmx.transmit();
    console.log("strobe white", strobewhite);
  }
})



const soundOptions = {
  channels: 2,
  bitDepth: 16,
  sampleRate: 44100
}

let lastBeat = Date.now();
new Microphone({ ...soundOptions, device: "pipewire" })
  .pipe(new BeatDetector({ sensitivity: 0.7 }))
  .on('peak-detected', () => { if (Math.abs(lastBeat - Date.now()) < 100) return; beat(Math.abs(lastBeat - Date.now())); lastBeat = Date.now(); })
  .pipe(new Gain({ gain: 0, ...soundOptions }))
  .pipe(new Speaker({ ...soundOptions }));
