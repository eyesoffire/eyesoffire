export function initAudio(){
  const toggle=document.querySelector('#audioDockToggle');
  const panel=document.querySelector('#audioPanel');
  const global=document.querySelector('#audioToggle');
  const set=()=>panel.classList.toggle('open');
  toggle?.addEventListener('click',set); global?.addEventListener('click',set);
}
export function setAudio(book){
  document.querySelector('#audioTitle').textContent = book ? `${book.title} — Soundtrack` : 'Eyes of Fire';
  document.querySelector('#audioStatus').textContent = book?.spotify ? 'Spotify soundtrack ready' : 'No soundtrack configured';
}
