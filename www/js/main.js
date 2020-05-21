//   Project: https://github.com/realsporkman/aquatic-mp
//   File:    /www/js/main.js
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

var service = {

  startup : function () {
    this.init_state();
    this.iter();
    this.srvmon();
  },

  iter : function () {

    const player_status = state.player.status();

    if (!state.player.in_flight && !state.queue.mutex) {
      var stable = (player_status==state.service.last_player_status);

      if (!stable || player_status!=state.player.underlight_status) {
        state.service.underlight_needs_updated = true;
      }

      if (state.service.underlight_needs_updated) {
        if (stable) {
          update_ctrls_underlight(player_status);
          state.service.underlight_needs_updated = false;
        }
      }

      if (stable && state.status_banner.banner_status!=state.player.underlight_status) {
        update_status_banner(state.player.underlight_status);
      }

      // Status banner & underlight also updated in do_play_song()

      if (state.player.minilight.id) {
        do_minilight_iter(player_status);
      }
    }

    state.service.last_player_status = player_status;
    state.service.heartbeat = ((state.service.heartbeat+1)%(0xffffffff));
    var tm;
    if (player_status) {
      tm = 1000;
      state.service.idle_cnt = 0;
    } else if (state.service.idle_cnt<30) {
      tm = 1000;
      ++state.service.idle_cnt;
    } else {
      tm = 3000;
    }
    setTimeout(function () { const f = service.iter; exec1(f); }, tm);
  },

  init_state : function () {
    state.service.heartbeat = 0;
    state.service.idle_cnt = 0;
    state.service.srvmon_last_hb = 0xffffffff;
    state.player.underlight_status = null;
    state.service.underlight_needs_updated = false;
    delete state.service.last_player_status;
    delete state.player.minilight.id;
  },

  srvmon : function () {
    if (state.service.srvmon_last_hb == state.service.heartbeat) {
      service.startup();
    } else {
      state.service.srvmon_last_hb = state.service.heartbeat;
      setTimeout(function () { const f = service.srvmon; exec1(f); },10000);
    }
  }
}


function write_welcome() {
  state.workspace.active = true;
  var res = lib_html.open_('section id="aquarium"');
  var res = lib_html.open_('section id="intro"');
  res += lib_html.open_('section id="intro_title"');
  res += 'Welcome to Aquatic!';
  res += lib_html.close('section');
  res += lib_html.open_('section id="intro_body"');
  res += '<p>To get started, click on an album name in the right-hand panel.&nbsp;&nbsp;&nbsp;&nbsp;----&gt;</p><br>';
  res += '<p>Once the album detail view appears here, you can click the "+" buttons to add individual songs or videos to the playlist, or you can';
  res += 'or you can click the "+++" button to add them all at once.</p><br>';
  res += '<p>&lt;----&nbsp;&nbsp;&nbsp;&nbsp;The playlist is in the left-hand panel. To start playing a song or video in the playlist, click on its title.</p><br>';
  res += '<p>To expand or retract a video, click on the triangular button in the lower-left corner.</p><br>';
  res += '<p>You can enjoy a relaxing aquarium view by clicking the "x" button in the album detail view in this section. ';
  res += 'The aquarium populates slowly, so please be patient.</p><br>';
  res += '<p>If the contents of this webpage seems too crowded or bulky, try reducing the zoom using your browser controls.</p><br>';
  res += '<p>Enjoy - smooth listening awaits!</p>';
  res += lib_html.close('section');
  res += lib_html.close('section');
  res += lib_html.close('section');
  lib_html.write('workspace',res,function () {});
}


////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////



function main() {
  if (typeof db === 'undefined') {
    // No db
    window.location.replace("err_no_db.html");
    return;
  }

  write_index();
  write_player();
  write_welcome();
  write_adspace();

  do_onresize();


  service.startup();
}


exec1(main);




