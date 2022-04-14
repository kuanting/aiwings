mapboxgl.accessToken =
  'pk.eyJ1Ijoid2FpdGluZzMzMTE4IiwiYSI6ImNrZDVlZWp6MjFxcXQyeHF2bW0xenU4YXoifQ.iGfojLdouAjsovJuRxjYVA';

const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/waiting33118/ckdfkx3t10k9w1irkp8anuy39', // style URL
  center: [121.537525, 25.042448], // starting position [lng, lat]  25.042448, 121.537525
  zoom: 16.5 // starting zoom
});

map.on('load', () => {
  const nav = new mapboxgl.NavigationControl({
    visualizePitch: true
  });
  map.addControl(nav, 'bottom-right');

  const dronePosition = [
    [121.5364948, 25.0432282],
    [121.5377288, 25.0435662],
    [121.5366238, 25.0417462],
    [121.538386, 25.042484]
  ];
  for (let x = 0; x <= 3; x++) {
    const droneElement = document.createElement('img');
    droneElement.width = 100;
    droneElement.src = 'img/drone2.gif';
    new mapboxgl.Marker({
      element: droneElement,
      draggable: true
    })
      .setLngLat(dronePosition[x])
      .addTo(map);
  }

  const bodyElement = document.querySelector('body');

  for (let x = 0; x <= 3; x++) {
    let position = [
      [100, 100],
      [100, 500],
      [700, 100],
      [700, 500]
    ];
    const videoBox = document.createElement('div');
    const video = document.createElement('video');
    const videoDragBar = document.createElement('div');
    videoBox.className = 'video-box';
    videoBox.style.left = `${position[x][0]}px`;
    videoBox.style.top = `${position[x][1]}px`;
    video.src = `video/${x}.mov`;
    video.autoplay = true;
    video.controls = true;
    video.muted = true;
    video.loop = true;
    videoDragBar.className = 'drag-bar';
    bindingEvents(videoDragBar);
    videoBox.append(videoDragBar, video);
    bodyElement.append(videoBox);
  }

  function bindingEvents(videoDragBar) {
    let startX;
    let startY;

    videoDragBar.addEventListener('mousedown', dragElement);
    function dragElement(e) {
      startX = e.clientX;
      startY = e.clientY;
      videoDragBar.addEventListener('mousemove', moveElement);
      videoDragBar.addEventListener('mouseup', looseElement);
    }

    function moveElement(e) {
      let parentElement = e.target.parentElement;
      let dragDisX = startX - e.clientX;
      let dragDisY = startY - e.clientY;
      startX = e.clientX;
      startY = e.clientY;
      parentElement.style.top = `${parentElement.offsetTop - dragDisY}px`;
      parentElement.style.left = `${parentElement.offsetLeft - dragDisX}px`;
    }

    function looseElement() {
      videoDragBar.removeEventListener('mouseup', looseElement);
      videoDragBar.removeEventListener('mousemove', moveElement);
    }
  }
});
