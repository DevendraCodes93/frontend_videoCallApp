import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useVideoStore } from "../store/videoStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Finding = () => {
  const { socket, startCall, setRoomId, remoteVideoRef, roomID, peerRef } =
    useVideoStore();
  const [seconds, setSeconds] = useState(20);
  const containerRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    socket?.on("room-joined", (roomID) => {
      setRoomId(roomID);
      startCall(); // Start the call immediately
      navigate("/video-share");
    });

    return () => {
      socket?.off("room-joined");
    };
  }, []);
  useEffect(() => {
    const intervalId = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    const timeoutId = setTimeout(() => {
      navigate("/");
      toast.error("no users online now !");
    }, 20000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: "power3.out" }
    );
  }, []);

  useEffect(() => {
    socket?.on("room-joined", (room) => {
      setRoomId(room);
    });

    socket?.on("ready", async () => {
      let tries = 0;
      while (!peerRef.current && tries < 10) {
        console.log("⏳ Waiting for peer to be created...");
        await new Promise((res) => setTimeout(res, 200));
        tries++;
      }

      const peer = peerRef.current;
      console.log("🎯 Peer after wait:", peer);

      if (!peer) {
        console.error("❌ Peer not ready even after waiting");
        return;
      }

      try {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit("signal", { roomID, data: { offer } });
        console.log("✅ Offer sent");
      } catch (err) {
        console.error("❌ Failed to create/send offer", err);
      }
    });

    socket?.on("signal", async (data) => {
      if (data.offer) {
        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(data.offer)
        );
        const answer = await peerRef.current.createAnswer();
        await peerRef.current.setLocalDescription(answer);
        socket.emit("signal", { roomID, data: { answer } });
      } else if (data.answer) {
        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
      } else if (data.candidate) {
        try {
          await peerRef.current.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
        } catch (err) {
          console.error("Error adding ICE candidate", err);
        }
      }
    });

    socket?.on("user-disconnected", () => {
      remoteVideoRef.current.srcObject = null;
      setRoomId(null);
      navigate("/");
      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
    });

    return () => {
      socket &&
        (socket.off("room-joined"),
        socket.off("ready"),
        socket.off("signal"),
        socket.off("user-disconnected"));
    };
  }, [roomID]);

  return (
    <div
      ref={containerRef}
      className="w-full h-screen flex flex-col justify-center items-center bg-black"
    >
      <div className="relative text-white text-3xl font-bold tracking-wider w-fit min-w-[3rem] h-fit overflow-hidden z-0">
        <p className="relative z-10">Finding...</p>

        <div
          className="absolute top-0 h-full aspect-square rounded-[20%] bg-white/10 backdrop-invert"
          style={{
            animation: "slideBox 2s ease-in-out infinite",
            position: "absolute",
            left: 0,
          }}
        />
        <style>
          {`
            @keyframes slideBox {
              0%, 100% { left: 0%; }
              50% { left: calc(100% - 3rem); }
            }
          `}
        </style>
      </div>

      <p className="text-white text-lg mt-4 opacity-75 animate-pulse font-semibold">
        Please wait, we are finding a user for the video call ...
      </p>

      <div className="absolute bottom-10 text-white text-lg opacity-90 animate-bounce">
        <span className="text-xl">Hold tight! {seconds}</span>
      </div>

      <style>
        {`
          .animate-bounce {
            animation: bounceText 1.5s infinite;
          }

          @keyframes bounceText {
            0% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
            100% {
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Finding;
