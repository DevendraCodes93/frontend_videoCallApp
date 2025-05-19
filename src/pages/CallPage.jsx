import React, { useEffect, useRef, useState } from "react";
import { useVideoStore } from "../store/videoStore";
import { useNavigate } from "react-router-dom";
import { MdCallEnd } from "react-icons/md";

const CallPage = () => {
  const {
    localVideo,
    setLocalVideoRef,
    setRemoteVideoRef,
    socket,
    loadingUser,
    roomID,
    setupSignalListener,
    startCall,
    connectSocket,
    disconnectSocket,
    joinRandom,
  } = useVideoStore();

  const navigate = useNavigate();
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [dragging, setDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  const [remoteStreamAvailable, setRemoteStreamAvailable] = useState(false);
  const remoteVideoRef = useRef(null);
  useEffect(() => {
    if (
      remoteRef.current !== remoteVideoRef.current &&
      remoteVideoRef.current
    ) {
      remoteVideoRef.current = remoteRef.current;
      console.log("Remote video element updated", remoteRef.current);
    }
  }, [remoteRef.current, remoteVideoRef.current]);

  const handleMouseDown = (e) => {
    setDragging(true);
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      setPosition({
        x: e.clientX - offset.current.x,
        y: e.clientY - offset.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  useEffect(() => {
    if (!socket) {
      navigate("/");
    }
  }, [socket, navigate]);

  // Save video refs to store
  useEffect(() => {
    setLocalVideoRef(localRef);
    setRemoteVideoRef(remoteRef);
  }, [setLocalVideoRef, setRemoteVideoRef]);

  // Attach local stream to video element
  useEffect(() => {
    if (localRef.current && localVideo) {
      localRef.current.srcObject = localVideo;
    }
  }, [localVideo]);

  // Listen for remote stream attach by watching remoteRef's srcObject
  useEffect(() => {
    const remoteVideoEl = remoteRef.current;

    if (!remoteVideoEl) return;

    const checkRemoteStream = () => {
      if (remoteVideoEl.srcObject) {
        setRemoteStreamAvailable(true);
      }
    };

    // Also listen to 'loadedmetadata' event as video stream is ready to play
    remoteVideoEl.addEventListener("loadedmetadata", () => {
      setRemoteStreamAvailable(true);
      remoteVideoEl.play().catch(() => {});
    });

    // Initial check
    checkRemoteStream();

    return () => {
      remoteVideoEl.removeEventListener("loadedmetadata", () => {});
    };
  }, [remoteRef]);

  // Setup socket listeners once socket is ready
  useEffect(() => {
    if (!socket) return;

    setupSignalListener();
    joinRandom();

    socket.on("user-disconnected", () => {
      navigate("/");
    });

    return () => {
      if (socket) {
        socket.off("signal");
        socket.off("room-joined");
        socket.off("ready");
        socket.off("user-disconnected");
        // disconnectSocket(roomID);
      }
    };
  }, [
    socket,
    roomID,
    navigate,
    setupSignalListener,
    joinRandom,
    disconnectSocket,
  ]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      disconnectSocket(socket, roomID);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [socket, roomID, disconnectSocket]);
  const startPollingForRemote = () => {
    startCall();

    socket.emit("retry-call", {
      roomID,
      data: {
        type: "poll",
        message: "Retrying connection or signaling...",
      },
    });

    setupSignalListener();
    let intervalId = setInterval(() => {
      if (remoteRef.current) {
        clearInterval(intervalId);
        intervalId = null;
      } else {
        console.log("Polling: calling setupSignalListener");
      }
    }, 5000);

    // Optionally call immediately once
    if (!remoteRef.current) {
      startCall();
      setupSignalListener();
      console.log("Immediate call to setupSignalListener");
    }
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <button
        onClick={() => disconnectSocket()}
        className="absolute right-2  mt-5 z-50 opacity-50  p-2  bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 cursor-pointer"
      >
        <MdCallEnd size={30} />
      </button>

      <div className="relative w-screen h-screen">
        <video
          ref={localRef}
          autoPlay
          muted
          playsInline
          onMouseDown={handleMouseDown}
          className="w-32 h-48 object-cover rounded-2xl transform scale-x-[-1] z-10 cursor-move absolute"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
        />

        <video
          ref={remoteRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover transform scale-x-[-1]"
        />

        {/* Show message if remote stream is NOT available */}
        {!remoteStreamAvailable && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 text-white text-center p-4">
            <h2 className="text-xl font-bold mb-2">
              waiting for user to join...
            </h2>
            <p>
              Please check your internet connection or wait for the other user
              to join.
            </p>
            <button
              onClick={() => {
                startPollingForRemote();
              }}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallPage;
