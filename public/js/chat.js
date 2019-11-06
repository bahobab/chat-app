const socket = io();

// ========================= DOM elements ==================

const $messageForm = document.querySelector('.chat-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// templates
const messageTemplate = document
  .querySelector('#message-template')
  .innerHTML;

const locationUrlTemplate = document
  .querySelector('#location-url')
  .innerHTML;

const sidebarTemplate = document
  .querySelector('#sidebar-template')
  .innerHTML;

// Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

// ==================== socket events =========================
socket.on('welcomeMessage', ({text, createdAt}) => {
  console.log(createdAt, text)

  const html = Mustache.render(messageTemplate, {
    username,
    text,
    createdAt: moment(createdAt).format('DD MMM YYYY, hh:mm ')
  });
  $messages.insertAdjacentHTML('beforeend', html)
});

const autoScroll = () => {
  // new message element
  const $newMessage = $messages.lastElementChild;

  // height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // visible height
  const visibleHeight = $messages.offsetHeight;

  // height of messages
  const messageContainerHeight = $messages.scrollHeight;

  // how height messages container has sscrolled
  const scrollOffset = $messages.scrollTop + visibleHeight; // ??

  if (messageContainerHeight - newMessageHeight <= scrollOffset) 
    $messages.scrollTop = $messages.scrollHeight;
  }

socket.on('message', ({text, createdAt}) => {
  const html = Mustache.render(messageTemplate, {
    username,
    text,
    createdAt: moment(createdAt).format('hh:mm')
  });
  $messages.insertAdjacentHTML('beforeend', html);

  autoScroll();
});

socket.on('locationMessage', ({username, url, createdAt}) => {

  const html = Mustache.render(locationUrlTemplate, {
    username,
    url,
    createdAt: moment(createdAt).format('hh:mm')
  });
  $messages.insertAdjacentHTML('beforeend', html);

  autoScroll();
});

socket.on('roomData', ({room, users}) => {
  const html = Mustache.render(sidebarTemplate, {room, users});
  document
    .querySelector('#sidebar')
    .innerHTML = html;
});

socket.emit('join', {
  username,
  room
}, error => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});

// ==================== event handlers ==================

$messageForm.addEventListener('submit', evt => {
  evt.preventDefault();

  $messageFormButton.disabled = true;

  let message = $messageFormInput.value;
  socket.emit('sendMessage', message, error => {
    $messageFormButton.disabled = false;
    $messageFormInput.value = '';
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }

  });
});

$sendLocationButton.addEventListener('click', evt => {
  if (!navigator.geolocation) {
    return console.log('Geolocation not suported');
  }
  $sendLocationButton.setAttribute('disabled', 'disabled');

  navigator
    .geolocation
    .getCurrentPosition(position => {
      const {latitude, longitude} = position.coords;
      socket.emit('sendLocation', {
        latitude,
        longitude
      }, message => {
        $sendLocationButton.disabled = false;
        conversation.textContent = conversation.textContent + '\n' + message;
      });
    });
});
