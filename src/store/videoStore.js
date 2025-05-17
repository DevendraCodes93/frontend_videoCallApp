import { create } from "zustand";
import { io } from "socket.io-client";
import { useAuthStore } from "./userStore.js";
const BASE_URL = "https://videocall-289k.onrender.com";
export const useVideoStore = create((set, get) => ({
  socket: null,
  localVideo: null, // 💧 MediaStream
  localVideoRef: { current: null }, // 📼 HTML video element ref
  remoteVideoRef: { current: null },
  peerRef: { current: null },
  loadingUser: false,
  setLocalVideo: (stream) => set({ localVideo: stream }),
  setLocalVideoRef: (ref) => set({ localVideoRef: ref }),
  setRemoteVideoRef: (ref) => set({ remoteVideoRef: ref }),

  roomID: null,
  setRoomId: (id) => set({ roomID: id }),

  connectSocket: () => {
    const authUser = useAuthStore.getState().authUser;
    if (!authUser || get().socket?.connected) return;
    const socket = io(BASE_URL, {
      query: { userId: authUser.user._id },
    });
    socket.connect();
    set({ socket });
  },

  joinRandom: () => {
    get().socket.emit("join-random");
  },

  disconnectSocket: () => {
    const socket = get().socket;
    const roomID = get().roomID;
    const peerRef = get().peerRef;

    console.log("DISCONNECT called, socket:", socket, "roomID:", roomID);

    if (socket && socket.connected) {
      if (roomID) {
        socket.emit("leave-room", roomID);

        setTimeout(() => {
          socket.disconnect();

          socket.off("room-joined");
          socket.off("ready");
          socket.off("signal");
          socket.off("user-disconnected");

          set({ socket: null, roomID: null });
        }, 500);
        if (peerRef.current) {
          peerRef.current.close();
          peerRef.current = null;
        }
      } else {
        console.warn("No roomID to leave");
        socket.disconnect();
        set({ socket: null, roomID: null });
      }
    } else {
      console.warn("Socket not connected");
      set({ socket: null, roomID: null });
    }
  },

  startCall: async () => {
    const {
      remoteVideoRef,
      localVideoRef,
      socket,
      roomID,
      setLocalVideo,
      peerRef, // ✅ Get the actual useRef from store
    } = get();

    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    setLocalVideo(localStream); // ✅ Save to store

    if (localVideoRef?.current) {
      localVideoRef.current.srcObject = localStream;
    }

    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    // ✅ Correctly assign to existing useRef
    peerRef.current = peerConnection;
    peerConnection.ontrack = (event) => {
      const remoteStream = event.streams[0];

      const tryAttach = () => {
        const remoteVideo = get().remoteVideoRef;
        set({ loadingUser: true });
        if (remoteVideo?.current) {
          if (remoteVideo.current.srcObject !== remoteStream) {
            remoteVideo?.current.pause();
            remoteVideo.current.srcObject = remoteStream;
          }

          remoteVideo.current.onloadedmetadata = () => {
            setTimeout(() => {
              set({ loadingUser: false });

              remoteVideo.current.play().catch((err) => {
                console.error("Error playing remote video:", err);
                set({ loadingUser: false });
              });
            }, 500);
          };
        } else {
          setTimeout(tryAttach, 500);
        }
      };

      tryAttach();
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Sending ICE candidate:", event.candidate);
        socket.emit("signal", { roomID, data: { candidate: event.candidate } });
      }
    };
    peerConnection.oniceconnectionstatechange = () => {
      console.log("ICE State:", peerConnection.iceConnectionState);
    };
  },
  setupSignalListener: () => {
    const { socket, peerRef, roomID } = get();

    socket.off("signal");
    socket.on("signal", async (data) => {
      const peer = peerRef.current;

      if (!peer) return;

      try {
        if (data.offer) {
          await peer.setRemoteDescription(
            new RTCSessionDescription(data.offer)
          );
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          socket.emit("signal", { roomID, data: { answer } });
        } else if (data.answer) {
          if (
            !peer.currentRemoteDescription &&
            peer.signalingState === "have-local-offer"
          ) {
            await peer.setRemoteDescription(
              new RTCSessionDescription(data.answer)
            );
          }
        } else if (data.candidate) {
          await peer.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      } catch (err) {
        console.error("Error in signal handler:", err);
      }
    });
  },
}));
