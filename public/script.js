const myname = prompt('Enter your name')
const socket = io('/')
const peer = new Peer(undefined, {
  path: '/mypeer',
  host: '/',
  port: '443',
})
const peers = {}
const videoGrid = document.getElementById('video-grid')
const myvideo = document.createElement('video')
const input = document.getElementById('chat-message')
const div = document.getElementById('chat-div')
const submit = document.getElementById('submit')
const invite = document.getElementById('invite')
const video = document.getElementById('video')
const audio = document.getElementById('audio')
const joinedinfo = document.getElementById('join')
const total = document.getElementById('total')
input.value = ''
let myvideoStream
myvideo.muted = true

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myvideoStream = stream
    addVideoStream(myvideo, stream)
    socket.on('user-connected', (userid, nam) => {
      total.innerText = parseInt(total.innerText) + 1
      connectNewUser(userid, myvideoStream)
      if (nam == null) {
        nam = userid
      }
      joinedinfo.innerText = `User ${nam} joined`

      setTimeout(() => {
        joinedinfo.innerText = ''
      }, 3000)
    })
  })

socket.on('disconnected', (userid, nam) => {
  console.log('hello')
  console.log(peers)
  if (peers[userid]) peers[userid].close()
  total.innerText = parseInt(total.innerText) - 1
  if (nam == null) {
    nam = userid
  }
  joinedinfo.innerText = `User ${nam} left`
  setTimeout(() => {
    joinedinfo.innerText = ''
  }, 3000)
})

peer.on('call', (call) => {
  total.innerText = parseInt(total.innerText) + 1
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      call.answer(myvideoStream)
      const video = document.createElement('video')
      call.on('stream', (userstream) => {
        addVideoStream(video, userstream)
      })
      call.on('error', (err) => {
        console.log(err)
      })
    })
})

peer.on('open', (id) => {
  total.innerText = parseInt(total.innerText) + 1
  socket.emit('join-room', Room, id, myname)
})

const connectNewUser = (id, stream) => {
  const caller = peer.call(id, stream)
  const video = document.createElement('video')

  caller.on('stream', (newstream) => {
    addVideoStream(video, newstream)
  })
  caller.on('close', () => {
    video.remove()
  })
  caller.on('error', () => {
    console.log('Something went wrong on stream')
  })
  peers[id] = caller
}

const addVideoStream = (video, stream) => {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}
socket.on('message', (value, name) => {
  const h2 = document.createElement('h2')
  const h3 = document.createElement('h3')
  h2.appendChild(document.createTextNode(name))
  h3.appendChild(document.createTextNode(value))
  div.append(h2, h3)
})

submit.addEventListener('click', (e) => {
  handlesubmit(e)
})

const handlesubmit = (e) => {
  e.preventDefault()
  if (input.value != '') {
    socket.emit('submit-message', input.value, myname)
    input.value = ''
  }
}

input.addEventListener('keydown', (e) => {
  if (e.keyCode === 13 && input.value !== '') {
    socket.emit('submit-message', input.value, myname)
    input.value = ''
  }
})

invite.addEventListener('click', async (e) => {
  const link = window.location.origin + '/join/' + Room
  await navigator.clipboard.writeText(link)
  alert('invite linked copied')
})

const video_on_off = (e) => {
  let enabled = myvideoStream.getVideoTracks()[0].enabled
  if (enabled) {
    myvideoStream.getVideoTracks()[0].enabled = false
    video.innerHTML = `<i class="fa-solid fa-video-slash "style="font-size: 24px"></i>`
  } else {
    myvideoStream.getVideoTracks()[0].enabled = true
    video.innerHTML = `<i class="fa-solid fa-video "style="font-size: 24px"></i>`
  }
}

const mute_on_off = () => {
  let enabled = myvideoStream.getAudioTracks()[0].enabled
  if (enabled) {
    audio.innerHTML =
      '<i class="fa-solid fa-microphone-slash" style="font-size: 24px"></i>'
    myvideoStream.getAudioTracks()[0].enabled = false
  } else {
    myvideoStream.getAudioTracks()[0].enabled = true
    audio.innerHTML =
      '<i class="fa-solid fa-microphone " style="font-size: 24px"></i>'
  }
}
