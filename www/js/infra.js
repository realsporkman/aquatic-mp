//   Project: https://github.com/realsporkman/aquatic-mp
//   File:    /www/js/infra.js
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

//state.adspace['full_ads_avail'] = {};

var state = {
  queue : {},
  player : {},
  service : {},
  workspace: {},
  aquarium: {}
}

state.queue.list = new lib_struct.LinkedList();

state.queue.add_song = function (s) {
  if (this.idmap && this.idmap[s.id]) {
    return;
  }

  this.list.push_back(s);

  if (!this.idmap) {
    this.idmap = {};
  }
  this.idmap[s.id] = this.list.last;
}

state.queue.rm_song = function (lnk) {
  this.list.erase(lnk);

  delete this.idmap[lnk.e.id];
}

state.queue.up_song = function (lnk) {
  this.list.move_forward(lnk);
}

state.queue.clear = function () {
  this.list.clear();
  delete this.idmap;
}


state.player['minilight'] = {};
state.player['cache'] = {};

state.player.status = function () {
  if (state.player.device && !state.player.device.ended) {
    if (state.player.device.paused) {
      return 'paused';
    } else {
      return 'playing';
    }
  }
  return null;
}


state.player.expanded = false;

// These two are mutexes
state.player.in_flight = false;
state.queue.mutex = false;

state.workspace.content = {};
state.workspace.active = false;
state.workspace.height = 0;
state.queue.visible = true;






