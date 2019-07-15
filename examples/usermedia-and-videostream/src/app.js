const config = {
  sdpSemantics: "unified-plan"
};

async function init() {
  const video = document.getElementById("video");

  const cameraStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  const sender = new RTCPeerConnection(config);
  const receiver = new RTCPeerConnection(config);

  const receiverStream = new MediaStream();
  window.getVideoStream = () => receiverStream;

  document.getElementById("v1").srcObject = cameraStream;
  document.getElementById("v2").srcObject = receiverStream;

  sender.onicecandidate = e => {
    e.candidate && receiver.addIceCandidate(e.candidate);
  };

  receiver.ontrack = e => {
    if (e.type === "track") {
      receiverStream.addTrack(e.track);
    }
  };

  receiver.onicecandidate = e => {
    e.candidate && sender.addIceCandidate(e.candidate);
  };

  addCameraModeEvent(sender, cameraStream, receiver);

  video.onplay = async () => {
    window.videoStream = video.captureStream();
    addVideoModeEvent(sender, receiver);
  };
}

init();

function addVideoModeEvent(sender, receiver) {
  document.getElementById("use-video").addEventListener("click", async e => {
    console.log("비디오로 세팅");

    if (sender.getSenders().length) {
      window.videoStream.getTracks().forEach(async (track, i) => {
        const senderToReplace = sender.getSenders().find(sender => {
          return sender.track.kind === track.kind;
        });

        await senderToReplace.replaceTrack(track);
      });
    } else {
      window.videoStream.getTracks().forEach(track => {
        sender.addTrack(track);
      });

      const senderDesc = await sender.createOffer({
        offerToReceiveVideo: false,
        offerToReceiveAudio: false,
        iceRestart: true
      });

      await sender.setLocalDescription(senderDesc);
      await receiver.setRemoteDescription(senderDesc);

      const receiverDesc = await receiver.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });

      await receiver.setLocalDescription(receiverDesc);
      await sender.setRemoteDescription(receiverDesc);
    }
  });
}

function addCameraModeEvent(sender, cameraStream, receiver) {
  document.getElementById("use-camera").addEventListener("click", async e => {
    console.log("카메라로 세팅");

    if (sender.getSenders().length) {
      cameraStream.getTracks().forEach(async (track, i) => {
        const senderToReplace = sender.getSenders().find(sender => {
          return sender.track.kind === track.kind;
        });

        await senderToReplace.replaceTrack(track);
      });
    } else {
      cameraStream.getTracks().forEach(track => {
        sender.addTrack(track);
      });

      const senderDesc = await sender.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: false,
        iceRestart: true
      });

      await sender.setLocalDescription(senderDesc);
      await receiver.setRemoteDescription(senderDesc);

      const recevierDesc = await receiver.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });

      await receiver.setLocalDescription(recevierDesc);
      await sender.setRemoteDescription(recevierDesc);
    }
  });
}
