//   Project: https://github.com/realsporkman/aquatic-mp
//   File:    /www/js/events.js
//
//   Copyright 2020 John R. Chase
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.
//

'use strict';


events.onclick['index'] = {}
events.onclick['album_songlist'] = {}
events.onclick['queue'] = {}
events.onclick['player_expand'] = {}
events.onclick['album_detail_ctrls'] = {}
events.onmouseover['album_songlist'] = {}
events.onmouseout['album_songlist'] = {}
events.onmouseover['player_expand'] = {}
events.onmouseout['player_expand'] = {}


events.onclick.index.link = function (lnk) {
  if (state.player.expanded) {
    return;
  }
  const a = db.albums[lnk.key];
  launch_album_detail(a);
}


events.onclick.album_songlist.add_song = function (s) {
  mutex_wrap(state.queue.mutex, s, function (song) {
    state.queue.add_song(song);
    write_player_queue();
  });
}


events.onclick.queue.rm_song = function (l) {
  mutex_wrap(state.queue.mutex, l, function (lnk) {
    if (state.queue.active==lnk) {
      do_clear_player();
    }
    state.queue.rm_song(lnk);
    write_player_queue();
  });
}


events.onclick.queue.up_song = function (l) {
  mutex_wrap(state.queue.mutex, l, function (lnk) {
    state.queue.up_song(lnk);
    write_player_queue();
  });
}


events.onclick.queue.play_song = function (lnk) {
  do_play_song(lnk);
}


events.onclick.queue.play_nxt_song = function () {
  const lnk = state.queue.active;
  if (lnk && lnk.nxt) {
    do_play_song(lnk.nxt);
  }
}


events.onclick.queue.play_prv_song = function () {
  const lnk = state.queue.active;
  if (lnk && lnk.prv) {
    do_play_song(lnk.prv);
  }
}


events.onclick.queue.clear = function (l) {
  if (state.player.expanded) {
    do_player_retex();
  }
  mutex_wrap(state.queue.mutex, l, function (lnk) {
    do_clear_player();
    state.queue.clear(lnk);
    write_player_queue();
  });
}

events.onmouseover.album_songlist.light_btn = function (song) {
  document.getElementById(song.id + '_song_btn_add_lit').style.backgroundColor = "#F0F1F6";
}


events.onmouseout.album_songlist.unlight_btn = function (song) {
  document.getElementById(song.id + '_song_btn_add_lit').style.backgroundColor = "#000000";
}


events.onresize = do_onresize;


window.onresize = function () {
  exec1(do_onresize);
}


events.onclick.player_expand = function () {
  do_player_retex();
}

events.onmouseover.player_expand = player_expand_btn_active;

events.onmouseout.player_expand = player_expand_btn_inactive;


events.onclick.album_detail_ctrls.addall = function (a) {
  mutex_wrap(state.queue.mutex, a, function (album) {
    lib_base.array_loop(album.music, function(music,i) {
      const s = music[i];
      state.queue.add_song(s);
    });
    write_player_queue();
  });
}


events.onclick.album_detail_ctrls.clear_workspace = function (a) {
  launch_album_detail(null);
}






