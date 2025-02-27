import GenericDevice from "@device/GenericDevice";
import { DMXSender } from "ArtNET";

export default class CWWWA extends GenericDevice {
  public constructor(dmx: DMXSender, address: number) {
    super(dmx, address, 5);
  }

  public setDimmer(dimmer: number) {
    this.setChannel(3, dimmer);
  }

  public setColor(cw: number, ww: number, a: number) {
    this.setChannel(0, cw);
    this.setChannel(1, ww);
    this.setChannel(2, a);
  }

  public setStrobe(strobe: number) {
    this.setChannel(4, strobe);
  }
}