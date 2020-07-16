import { EXECUTION_CONTEXT } from '../context';
import { globalThis } from '../globalThis';
import { WebRTC } from './interface';


function loadWebRTC(): WebRTC {
  switch (EXECUTION_CONTEXT) {
    case 'nodejs':
      return require('wrtc');
    case 'browser':
      return {
        MediaStream: globalThis.MediaStream,
        MediaStreamTrack: globalThis.MediaStreamTrack,
        RTCDataChannel: globalThis.RTCDataChannel,
        RTCDataChannelEvent: globalThis.RTCDataChannelEvent,
        RTCDtlsTransport: globalThis.RTCDtlsTransport,
        RTCIceCandidate: globalThis.RTCIceCandidate,
        RTCIceTransport: globalThis.RTCIceTransport,
        RTCPeerConnection: globalThis.RTCPeerConnection,
        RTCPeerConnectionIceEvent: globalThis.RTCPeerConnectionIceEvent,
        RTCRtpReceiver: globalThis.RTCRtpReceiver,
        RTCRtpSender: globalThis.RTCRtpSender,
        RTCRtpTransceiver: globalThis.RTCRtpTransceiver,
        RTCSessionDescription: globalThis.RTCSessionDescription,
      };
    default:
      throw new Error(`Unknown execution context`);
  }
}

const $exports = loadWebRTC();

export const MediaStream = $exports.MediaStream;
export const MediaStreamTrack = $exports.MediaStreamTrack;
export const RTCDataChannel = $exports.RTCDataChannel;
export const RTCDataChannelEvent = $exports.RTCDataChannelEvent;
export const RTCDtlsTransport = $exports.RTCDtlsTransport;
export const RTCIceCandidate = $exports.RTCIceCandidate;
export const RTCIceTransport = $exports.RTCIceTransport;
export const RTCPeerConnection = $exports.RTCPeerConnection;
export const RTCRtpReceiver = $exports.RTCRtpReceiver;
export const RTCRtpSender = $exports.RTCRtpSender;
export const RTCRtpTransceiver = $exports.RTCRtpTransceiver;
export const RTCSessionDescription = $exports.RTCSessionDescription;

export function saveGlobalWRTC() {
  Object.assign(globalThis, $exports);
}
