import qrcode from "qrcode-terminal";
export function getQRCode(msg: string, opts?: { small: boolean }) {
  return new Promise((r) => {
    qrcode.generate(msg, opts, function (qrcode) {
      r(qrcode);
    });
  });
}
