const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true; 
let myVideoStream;
const user = prompt("Enter your name");
// initialize the PeerJS connection with the server
const peer = new Peer(undefined, {
  host: "/",
  port: "3030", 
  path: "/peerjs",
});
//  Asking permission to allow(both audio and video)
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    //getting live video
    myVideoStream = stream;
    addVideoStream(myVideo, stream); 

    // When a call is made by another peer (user B answers the call)
    peer.on("call", (call) => {
      call.answer(stream); // answer the call 

      const video = document.createElement("video"); // Create a new video element
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream); // Add the incoming stream
      });
    });

    // Listen for when a new user joins and connect to that user
    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream); // Call the new user
    });
  });

// When the peer connection is open, notify the room
peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id, user); // Emit event to join the room
});

// Function to call a newly connected user and share streams
const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream); // Call the newly connected user
  const video = document.createElement("video"); // Create a video element for the new user's stream
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream); // Add the new user's video stream to the DOM
  });
};

// Function to add video streams to the DOM
const addVideoStream = (video, stream) => {
  video.srcObject = stream; // Set the video source to the stream
  video.addEventListener("loadedmetadata", () => {
    video.play(); // Play the video when it's ready
  });
  videoGrid.append(video); // Append the video element to the grid
};

// Mute and Stop Video Functionality
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");

muteButton.addEventListener("click", () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false; // Mute audio
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = `<i class="fas fa-microphone-slash"></i>`;
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true; // Unmute audio
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = `<i class="fas fa-microphone"></i>`;
  }
});

stopVideo.addEventListener("click", () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false; // Stop video
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = `<i class="fas fa-video-slash"></i>`;
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true; // Start video
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = `<i class="fas fa-video"></i>`;
  }
});

// Invite button functionality
const inviteButton = document.querySelector("#inviteButton");
inviteButton.addEventListener("click", () => {
  prompt("Copy this link and send it to people you want to meet with", window.location.href);
});
