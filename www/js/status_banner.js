//   Project: https://github.com/realsporkman/aquatic-mp
//   File:    /www/js/status_banner.js
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


state.status_banner = {};
state.status_banner.visible = false;
state.status_banner.text_elem = [ null, null ];
state.status_banner.iter = 0;
state.status_banner.i0 = 5;
state.status_banner.i1 = 0;


const sb_consts = {
  text_spacing: 32
};


function update_status_banner(player_status) {

  if (!('elem' in state.status_banner)) {
    state.status_banner.elem = document.getElementById('status_banner');
    state.status_banner.text_elem[0] = document.getElementById('sb_text0');
    state.status_banner.text_elem[1] = document.getElementById('sb_text1');
  }

  if (player_status=='playing' || player_status=='paused') {
    const s = state.player.device_song;
    var text = s.title;
    if ('artist' in s) {
      text += ' - ' + s['artist'];
    }

    var res = '';
    res += text;
    lib_html.write('sb_text1',res,function () {});

    res = '';
    res += lib_html.open_('span id="sb_text_span"');
    res += text;
    res += lib_html.close('span');

    state.status_banner.paused = (player_status=='paused');
    if (state.status_banner.paused) {
      state.status_banner.elem.style.borderColor = pause_yellow;
    } else {
      state.status_banner.elem.style.borderColor = play_green;
    }

    state.status_banner.visible = true;

    function launch_banner() {

      const e = document.getElementById('sb_text_span');
      state.status_banner.text_width = e.offsetWidth;
      const text_offset = state.status_banner.text_width + sb_consts.text_spacing;
      const text_offset2 = 2*text_offset;

      if (state.status_banner.i0>text_offset) {
        state.status_banner.i0 -= text_offset2;
      }
      state.status_banner.i1 = state.status_banner.i0 + text_offset;
      if (state.status_banner.i1>text_offset) {
        state.status_banner.i1 -= text_offset2;
      }

      function set_text_pos(j,k) {
        state.status_banner.text_elem[0].style.left = j + 'px';
        state.status_banner.text_elem[1].style.left = k + 'px';
      }

      set_text_pos(state.status_banner.i0,state.status_banner.i1);
      ++state.status_banner.iter;
      const iter_id = state.status_banner.iter;

      function do_banner_scroll() {
        if (iter_id==state.status_banner.iter) {
          --state.status_banner.i0;
          --state.status_banner.i1;
          if (state.status_banner.i0<-state.status_banner.text_width) {
            state.status_banner.i0 += text_offset2;
          }
          if (state.status_banner.i1<-state.status_banner.text_width) {
            state.status_banner.i1 += text_offset2;
          }
          set_text_pos(state.status_banner.i0,state.status_banner.i1);
          setTimeout(function () {
            do_banner_scroll();
          },78);
        }
      }

      if (!state.status_banner.paused) {
        do_banner_scroll(state.status_banner.i);
      }
    }

    lib_html.write('sb_text0',res,launch_banner);

    state.status_banner.elem.style.visibility = 'visible';
  } else {
    state.status_banner.elem.style.visibility  = 'hidden';
    lib_html.write('sb_text1','',function () {});
    lib_html.write('sb_text0','',function () {});
    state.status_banner.visible = false;
    state.status_banner.text_width = 0;
  }

  state.status_banner.banner_status = player_status;
}

