//   Project: https://github.com/realsporkman/aquatic-mp
//   File:    /www/js/body.js
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

const fade_out_s = 0.032;
const fade_in_s = 0.44;

const fast_fade_out_s = 0.008;
const fast_fade_in_s = 0.08;

const btn_push_fade_out_s = fast_fade_out_s;
const btn_push_fade_in_s = fast_fade_in_s;

const album_cover_art_width = 300;
const player_cover_art_width = 360;

const pq_play_num_minilights = 4;

const pause_yellow = '#e7e532';
const play_green = '#00d500';
const play_green_minilight = '#00e000';

//
// player retex params
//

// player_device
const reg_player_device_x = 34;
const reg_player_device_y = 24;
const exp_player_device_x = 522;
const exp_player_device_y = 110;
const reg_player_width = 640;
const exp_player_width = 1314;

// player_queue
const reg_player_queue_x = 32;
const reg_player_queue_y = 520;
const exp_player_queue_x = 22;
const exp_player_queue_y = 60;
const reg_player_queue_width = 576;
const exp_player_queue_width = 442;

const player_queue_height_diff = reg_player_queue_y - exp_player_queue_y;

// player_queue_ctrls
const reg_player_queue_ctrls_width = 568;
const exp_player_queue_ctrls_width = 434;

// player_queue_ctrls_underlight
const reg_player_queue_ctrls_underlight_width = 568;
const exp_player_queue_ctrls_underlight_width = 484;



/**********************************************************/



/**********************************************************/

function do_play_song(l) {

  mutex_wrap(state.queue.mutex, l, function (lnk) {

    if (!lnk) {
      do_clear_player();
      write_player_queue();
      return;
    }

    const w = state.player.expanded ? exp_player_width : reg_player_width;

    const s = lnk.e;

    var res = '';

    if (!s.is_video) {
      const album = db.albums[s.album_dir]
      const cover_dat = get_cover_image_dat(album.covers,player_cover_art_width);
      res += lib_html.open_('div id="player_cover_art"');
      res += cover_dat.html;
      res += lib_html.close('div');
    }

    res += lib_html.song_tag(s.path,s.id + '_player_device',s.is_video,w);

    state.queue.active = lnk;

    function set_player_cb() {
      state.player.device = document.getElementById(s.id + '_player_device');
      if (state.player.device) {
        state.player.device.onended = function () { var t = lnk; exec2(do_play_song,t.nxt); }
        state.player.device_song = s;
      }
      function do_status_update() {
        const status = state.player.status();
        update_status_banner(status);
        update_ctrls_underlight(status);
      }
      do_status_update();
      state.player.device.onpause = do_status_update;
      state.player.device.onplaying = do_status_update;
    }

    lib_html.write('player_device',res,set_player_cb,fade_in_s,fade_out_s);
  });

  write_player_queue();
}

function do_clear_player() {

  delete state.queue.active;

  function set_player_cb() {
    delete state.player.device;
    delete state.player.device_song;
  }

  lib_html.write('player_device','',set_player_cb);
}

/**********************************************************/

function get_video_img(m) {
  var res = '';
  if ('id_nm' in m) {
    var id_arr = db.img_lib[m['id_nm']];
    if (id_arr) {
      var id = id_arr;
	  var img = id_map[id];
	  if (img && img.is_image) {
	    // Image should be 224x128, r=1.75
        res = lib_html.img_tag(img.path,'','','90px','class="video_thumb_ad"');
	  }
    }
  }

  return res;
}


function html_song_ad(m, artist) {
  var res = '';
  const id = m['id'];
  if (m.is_video) {
    res += get_video_img(m);
  }
  res += lib_html.open_('div id="' + id + '_song_list_elem_ad" class="song_list_elem_ad"');
  res += lib_html.open_('div id="' + id + '_song_controls_ad" class="song_controls_ad"');
  res += lib_html.open_('div id="' + id + '_song_btn_add_ad" class="button song_btn_add_ad"');
  res += lib_html.open_('div id="' + id + '_song_btn_add_lit" class="button_back"');
  res += lib_html.close('div');
  res += lib_html.img_tag('/img/song_add_btn.png','','24px','13px','style="position: absolute; left: 1px; top: 3px"');
  res += lib_html.close('div');
  res += lib_html.close('div');
  const show_artist = (('artist' in m) && m.artist.toLowerCase()!=artist.toLowerCase());
  var title_w;
  if (show_artist) {
    title_w = "width: 355px";
  } else {
    title_w = "width: 552px";
  }
  res += lib_html.open_('div id="' + id + '_song_title_ad" class="song_title_ad" title = "' + m.title + '" style="' + title_w + '"');
  res += m.title;
  res += lib_html.close('div');
  if (show_artist) {
    res += lib_html.open_('div id="' + id + '_song_artist_ad" class="song_artist_ad" title = "' + m.artist + '"');
    res += m.artist;
    res += lib_html.close('div');
  }
  res += lib_html.open_('div id="' + id + '_song_year_ad" class="song_year_ad"');
  if ('year' in m) {
    res += m['year'];
  }
  res += lib_html.close('div');
  res += lib_html.open_('div id="' + id + '_song_len_ad" class="song_len_ad"');
  if ('duration' in m) {
    res += m['duration'];
  }
  res += lib_html.close('div');
  res += lib_html.close('div');
  return res;
}

function html_song_pq(m,is_active) {
  const dexp = (state.player.expanded) ? '_exp' : '';
  var res = '';
  const id = m['id'];
  res += lib_html.open_('div id="' + id + '_song_list_elem_pq" class="song_list_elem_pq' + dexp + '"');
    res += lib_html.open_('div id="' + id + '_song_controls_pq" class="song_controls_pq"');
      res += lib_html.open_('div id="' + id + '_song_btn_rm_pq" class="button song_btn_rm_pq"');
        res += lib_html.open_('div id="' + id + '_song_btn_rm_lit" class="button_back"');
        res += lib_html.close('div');
        res += lib_html.img_tag('/img/song_rm_btn.png','','24px','13px','style="position: absolute; left: 1px; top: 3px"');
      res += lib_html.close('div');
      res += lib_html.open_('div id="' + id + '_song_btn_up_pq" class="button song_btn_up_pq"');
        res += lib_html.open_('div id="' + id + '_song_btn_up_lit" class="button_back"');
        res += lib_html.close('div');
        res += lib_html.img_tag('/img/song_up_btn.png','','24px','13px','style="position: absolute; left: 1px; top: 3px"');
      res += lib_html.close('div');
      res += lib_html.open_('div id="' + id + '_song_btn_down_pq" class="button song_btn_dn_pq"');
        res += lib_html.open_('div id="' + id + '_song_btn_dn_lit" class="button_back"');
        res += lib_html.close('div');
        res += lib_html.img_tag('/img/song_dn_btn.png','','24px','13px','style="position: absolute; left: 1px; top: 3px"');
      res += lib_html.close('div');
      if (is_active) {
        for (var i=0; i<pq_play_num_minilights; ++i) {
          const x = 11 + 9*i;
          res += lib_html.open_('div id="' + id + '_ml' + i + '" class="minilight" style="left: ' + x + 'px"'); res += lib_html.close('div');
        }
      }
    res += lib_html.close('div');
    res += lib_html.open_('div id="' + id + '_song_title_pq" class="song_title_pq' + dexp + '" title = "' + m.title + '"');
      res += m.title;
    res += lib_html.close('div');
    var artist = '';
    if ('artist' in m) {
      artist = m['artist'];
    }
    res += lib_html.open_('div id="' + id + '_song_artist_pq" class="song_artist_pq' + dexp + '" title = "' + artist + '"');
      res += artist;
    res += lib_html.close('div');
    var album = '';
    if ('album' in m) {
      album = m['album'];
    }
    res += lib_html.open_('div id="' + id + '_song_album_pq" class="song_album_pq' + dexp + '" title = "' + album + '"');
      res += album;
    res += lib_html.close('div');
    res += lib_html.open_('div id="' + id + '_song_len_pq" class="song_len_pq' + dexp + '"');
    if ('duration' in m) {
      res += m['duration'];
    }
    res += lib_html.close('div');
  res += lib_html.close('div');
  return res;
}


function get_cover_image_dat(covers, width) {
  var path;
  var title;
  var w, h;
  if (covers.length) {
    const c = covers[0];
    path = c.path;
    title = c['title'];
    w = c.w;
    h = c.h;
  } else {
    path = '/img/gen_cover.jpg';
    title = 'Album';
    w = 500;
    h = 500;
  }
  var res = {};
  res.height = scale_dimension(w,h,width);
  res.html =  lib_html.img_tag(path,title + ' Cover Art',width + 'px',res.height + 'px');
  return res;
}


function get_default_album_detail() {
  var res = lib_html.open_('section id="aquarium"');
  res += lib_html.close('section');
  return res;
}

function write_album_detail() {
  const a = state.workspace.content;
  if (a && state.workspace.active) {
    var res = lib_html.open_('section id="workspace_album_detail"');
    res += lib_html.open_('section id="workspace_cover_art"');
    const cover_dat = get_cover_image_dat(a.covers,album_cover_art_width);
    const cover_height = cover_dat.height;
    res += cover_dat.html;
    res += lib_html.open_('section id="workspace_album_descrip"');
    const parsed_title = a.title.split(' \- ',2);
    res += lib_html.open_('table');
    res += lib_html.open_('tr');
    res += lib_html.open_('td');
    res += lib_html.open_('section id="workspace_album_artist"');
    res += parsed_title[0];
    res += lib_html.close('section');
    res += lib_html.close('td');
    res += lib_html.close('tr');
    if (parsed_title.length>1) {
      res += lib_html.open_('tr');
      res += lib_html.open_('td');
      res += lib_html.open_('section id="workspace_album_title"');
      res += parsed_title[1];
      res += lib_html.close('section');
      res += lib_html.close('td');
      res += lib_html.close('tr');
    }
    res += lib_html.close('table');
    res += lib_html.close('section');

    res += lib_html.open_('section id="album_detail_ctrls"');
    res += lib_html.open_('section id="album_detail_ctrls_addall_btn" class="ctrls_btn"');
      res += '+++';
    res += lib_html.close('section');
    res += lib_html.open_('section id="album_detail_ctrls_x_btn" class="ctrls_btn"  title="Show aquarium"');
      res += 'X';
    res += lib_html.close('section');
    res += lib_html.close('section');

    res += lib_html.open_('section id="workspace_song_list"');
    res += lib_html.open_('table');
    lib_base.array_loop(a.music, function(music,i) {
      res += lib_html.open_('tr');
      res += lib_html.open_('td');
      res += lib_html.open_('div id="workspace_song' + i + '" class="list_elem workspace_song_list_elem"');
      const m = music[i];
      res += html_song_ad(m,parsed_title[0]);
      res += lib_html.close('div');
      res += lib_html.close('td');
      res += lib_html.close('tr');
    });
    res += lib_html.close('table');
    res += '<br><br>';
    res += lib_html.close('section');
    res += lib_html.close('section');

    function setup_onclicks() {
      lib_base.array_loop(a.music, function(music,i) {
        const s = music[i];
        var e = document.getElementById(s.id + '_song_btn_add_ad');
        if (e) {
          e.onclick = function () { var l = s; exec2(events.onclick.album_songlist.add_song,l); }
          e.onmouseover = function () { var l = s; exec2(events.onmouseover.album_songlist.light_btn,l); }
          e.onmouseout = function () { var l = s; exec2(events.onmouseout.album_songlist.unlight_btn,l); }
        }
      });
      if (a.covers.length) {
        const c = a.covers[0];
        var e = document.getElementById('workspace_cover_art');
        if (e) {
          e.style.width = album_cover_art_width;
          e.style.height = cover_height;
        }
      }
      var e = document.getElementById('album_detail_ctrls_addall_btn');
      if (e) {
        e.onclick = function () { var l = a; exec2(events.onclick.album_detail_ctrls.addall,l); }
      }
      var e = document.getElementById('album_detail_ctrls_x_btn');
      if (e) {
        e.onclick = function () { var l = a; exec2(events.onclick.album_detail_ctrls.clear_workspace,l); }
      }
    }
    state.aquarium.enabled = false;
    lib_html.write('workspace',res,setup_onclicks,fade_in_s,fade_out_s);
  } else {
    lib_html.write('workspace',get_default_album_detail(),function () {
                                                        if (state.aquarium.init) {
                                                          state.aquarium.enabled = state.workspace.active;
                                                          launch_aquarium();
                                                        }
                                                      },fade_in_s,fade_out_s);
  }
}


function launch_album_detail(a) {
  state.aquarium.init = true;
  if (a) {
    if (state.player.expanded) {
      do_player_retex();
    }
    state.workspace.content = a;
    state.workspace.active = true;
  } else if (state.workspace.content) {
    delete state.workspace.content;
  }
  write_album_detail();
}


function write_index() {
  var res = '<br><br><br>';
  var first = true;
  const index = db['index'];
  if ((typeof index === 'undefined') || !index.length) {
    lib_html.write('index','<br><br><br><br><div class="index_letter"><center>No albums to show!</center></div>',function () {});
    return;
  }
  lib_base.array_loop(index, function(index,i) {
    const grp = index[i];
    lib_base.jssert(grp.length==2,'in write_index len chk')
    const letter = grp[0];
    const links = grp[1];
    if (!first) {
      res += '<br>';
    }
    first = false;
    res += '<div class="index_letter">' + letter + '</div><br><div class="index_body">';
    lib_base.array_loop(links, function(links,i) {
      const a = links[i];
      const album = db.albums[a.key];
      if (album.music.length) {
        res += '<a id="' + a.id + '" title="' + a.title + '"><div class="list_elem index_link">' + a.title + '</div></a>';
      }
    });
    res += '</div>';
  });
  res += '<br><br>';

  function setup_onclicks() {
    lib_base.array_loop(index, function(index,i) {
      const links = index[i][1];
      lib_base.array_loop(links, function(links,i) {
        document.getElementById(links[i].id).onclick = function () { const l = links[i]; exec2(events.onclick.index.link,l); }
      });
    });
  }

  lib_html.write('index',res,setup_onclicks,fade_in_s);
}


function write_player_queue() {
  var res = '';
  var setup_onclicks;

  if (state.queue.visible) {
    var links = [];
    res += lib_html.open_('table');
    for (var i=0, p=state.queue.list.first; p; p = p.nxt, i+=1) {
      links.push(p);
      res += lib_html.open_('tr');
      res += lib_html.open_('td');
      res += lib_html.open_('section id="queue_song' + i + '" class="list_elem queue_song_list_elem"');
      res += html_song_pq(p.e,(('active' in state.queue) && p==state.queue.active));
      res += lib_html.close('section');
      res += lib_html.close('td');
      res += lib_html.close('tr');
    }
    res += lib_html.close('table');
    res += '<br><br><br><br><br>';

    function do_setup_onclicks() {
      lib_base.array_loop(links, function(links,i) {
        const p = links[i];
        const id = p.e.id;
        document.getElementById(id + '_song_title_pq').onclick    = function () { exec2(events.onclick.queue.play_song,p); }
        document.getElementById(id + '_song_btn_rm_pq').onclick   = function () { exec2(events.onclick.queue.rm_song,p); }
        document.getElementById(id + '_song_btn_up_pq').onclick   = function () { exec2(events.onclick.queue.up_song,p); }
        document.getElementById(id + '_song_btn_down_pq').onclick = function () { if (p.nxt) { exec2(events.onclick.queue.up_song,p.nxt); }}
        var e = document.getElementById('queue_song' + i);
        var f = document.getElementById(id + '_song_title_pq');
        if (('active' in state.queue) && p==state.queue.active) {
          e.style.backgroundColor = '#0c2375';
          f.style.color = '#ffffff';
          var j = pq_play_num_minilights-1;
          state.player.minilight.id = id + '_ml';
          state.player.minilight.j = j;
          state.player.minilight.svc_modulo = 2;
        } else {
          e.style.backgroundColor = '';
          f.style.color = '';
        }
      });
    }

    setup_onclicks = do_setup_onclicks;

  } else {

    setup_onclicks = function () {};

  }

  state.player.minilight.clear();

  lib_html.write('player_queue_body',res,setup_onclicks);
}


function write_player() {
  var res = '';

  res += lib_html.open_('section id="player_device"');
  res += lib_html.close('section');
  res += lib_html.open_('section id="player_queue"');
  res += lib_html.open_('section id="player_queue_ctrls"');
  res += lib_html.open_('section id="player_queue_ctrls_back_btn" class="ctrls_btn"');
    res += '<<';
  res += lib_html.close('section');
  res += lib_html.open_('section id="player_queue_ctrls_fwd_btn" class="ctrls_btn"');
    res += '>>';
  res += lib_html.close('section');
  res += lib_html.open_('section id="player_queue_ctrls_clear_btn" class="ctrls_btn"');
    res += 'CLEAR';
  res += lib_html.close('section');
  res += lib_html.close('section');
  res += lib_html.open_('section id="player_queue_ctrls_underlight"');
  res += lib_html.close('section');
  res += lib_html.open_('section id="player_queue_body"');
  res += lib_html.close('section');
  res += lib_html.close('section');
  res += lib_html.open_('section id="player_expand_btn"');
  //res += lib_html.open_('section id="player_expand_btn_img"');

  res += lib_html.img_tag('/img/player_expand.png','Maximize the player','','','id="peb_e" class="player_expand_btn_img"');
  res += lib_html.img_tag('/img/player_expand_active.png','Maximize the player','','','id="peb_e_a" class="player_expand_btn_img"');
  res += lib_html.img_tag('/img/player_retract.png','Minimize the player','','','id="peb_r" class="player_expand_btn_img"');
  res += lib_html.img_tag('/img/player_retract_active.png','Minimize the player','','','id="peb_r_a" class="player_expand_btn_img"');

  //res += lib_html.close('section');
  res += lib_html.close('section');

  function setup_player_retex_btn() {
    state.player.cache.retex_btn_expand = document.getElementById('peb_e');
    state.player.cache.retex_btn_expand_active = document.getElementById('peb_e_a');
    state.player.cache.retex_btn_retract = document.getElementById('peb_r');
    state.player.cache.retex_btn_retract_active = document.getElementById('peb_r_a');
    var e = document.getElementById('player_expand_btn');
    e.onclick = function () { exec2(events.onclick.player_expand); }
    e.onmouseover = function () { exec2(events.onmouseover.player_expand); }
    e.onmouseout = function () { exec2(events.onmouseout.player_expand); }
    e = document.getElementById('player_queue_ctrls_clear_btn');
    e.onclick = function () { exec2(events.onclick.queue.clear); }
    e = document.getElementById('player_queue_ctrls_back_btn');
    e.onclick = function () { exec2(events.onclick.queue.play_prv_song); }
    e = document.getElementById('player_queue_ctrls_fwd_btn');
    e.onclick = function () { exec2(events.onclick.queue.play_nxt_song); }
    player_expand_btn_inactive();
  }

  lib_html.write('player_body',res,setup_player_retex_btn,fade_in_s);
}


function update_player_expand_btn(val) {
  state.player.cache.retex_btn_expand.style.opacity = 0;
  state.player.cache.retex_btn_expand_active.style.opacity = 0;
  state.player.cache.retex_btn_retract.style.opacity = 0;
  state.player.cache.retex_btn_retract_active.style.opacity = 0;

  state.player.cache[val].style.opacity = 1;
}


function player_expand_btn_active() {
  if (state.player.expanded) {
    update_player_expand_btn('retex_btn_retract_active');
  } else {
    update_player_expand_btn('retex_btn_expand_active');
  }
}


function player_expand_btn_inactive() {
  if (state.player.expanded) {
    update_player_expand_btn('retex_btn_retract');
  } else {
    update_player_expand_btn('retex_btn_expand');
  }
}


function set_player_ctrl_underlight(color) {
  var res = '';
  if (color) {
    res = lib_html.img_tag('/img/player_queue_ctl_underlight_' + color + '.png','', '', '', '');
    state.player.underlight_on = true;
  } else {
    state.player.underlight_on = false;
  }
  lib_html.write('player_queue_ctrls_underlight',res,function () {},0.002,0.002);
}


state.player.minilight.set_backgr = function (id, val) {
  var e = document.getElementById(id);
  if (e) {
    e.style.backgroundColor = val;
  }
}


state.player.minilight.set_all = function (color) {
  for (var i=0; i<pq_play_num_minilights; ++i) {
    state.player.minilight.set_backgr(state.player.minilight.id + i, color);
  }
}


state.player.minilight.clear = function () {
  state.player.minilight.set_all('');
}


function do_minilight_iter(player_status) {

  if (!state.queue.visible) {
    return;
  }

  const xtion = (state.service.last_player_status != player_status);

  if (player_status=='playing') {
    state.player.minilight.set_all('');
    if (!xtion) {
      state.player.minilight.j = ((state.player.minilight.j + 1)%pq_play_num_minilights);
      state.player.minilight.set_backgr(state.player.minilight.id + state.player.minilight.j, play_green_minilight);
    }
  } else if (player_status=='paused') {
    const e = document.getElementById(state.player.minilight.id + state.player.minilight.j);
    if (e && e.style.backgroundColor != pause_yellow) {
      state.player.minilight.set_all(pause_yellow);
      state.player.minilight.j = 0;
    }
  } else {
    state.player.minilight.set_all('');
    state.player.minilight.j = 0;
  }
}


function update_ctrls_underlight(player_status) {
  if (player_status==state.player.underlight_status &&
      state.player.expanded==state.player.underlight_expanded) {
    return;
  }
  state.player.underlight_status = player_status;
  state.player.underlight_expanded = state.player.expanded;
  const e = document.getElementById('player_queue_ctrls_underlight');
  if (player_status=='playing') {
    set_player_ctrl_underlight(state.player.expanded ? 'green_exp' : 'green');
  } else if (player_status=='paused') {
    set_player_ctrl_underlight(state.player.expanded ? 'yellow_exp' : 'yellow');
  } else {
    set_player_ctrl_underlight('');
  }
}


function do_player_retex() {
  if (state.player.in_flight || (!state.player.device && !state.player.expanded) || lib_html.inwrite_mtx['workspace']) {
    return;
  }
  state.player.in_flight = true;

  state.queue.visible = false;

  update_ctrls_underlight(null);

  var a0x, a0y, a1x, a1y, b0, b1;
  var q0x, q0y, q1x, q1y, q0w, q1w;
  var qc0w, qc1w;
  var qcc0l, qcc1l;
  var pqb0h, pqb1h;

  if (state.player.expanded) {
    a0x = exp_player_device_x;
    a0y = exp_player_device_y;
    b0  = exp_player_width;
    a1x = reg_player_device_x;
    a1y = reg_player_device_y;
    b1  = reg_player_width;
    state.workspace.active = true;

    q0x = exp_player_queue_x;
    q0y = exp_player_queue_y;
    q0w = exp_player_queue_width;
    q1x = reg_player_queue_x;
    q1y = reg_player_queue_y;
    q1w = reg_player_queue_width;

    qc0w = exp_player_queue_ctrls_width;
    qc1w = reg_player_queue_ctrls_width;

    qcc0l = exp_player_queue_ctrls_width - 77;
    qcc1l = reg_player_queue_ctrls_width - 77;

    pqb0h = (window.innerHeight - (620 - player_queue_height_diff));
    pqb1h = (window.innerHeight - 620);
  } else {
    a0x = reg_player_device_x;
    a0y = reg_player_device_y;
    b0  = reg_player_width;
    a1x = exp_player_device_x;
    a1y = exp_player_device_y;
    b1  = exp_player_width;
    state.workspace.active = false;
    write_album_detail();

    q0x = reg_player_queue_x;
    q0y = reg_player_queue_y;
    q0w = reg_player_queue_width;
    q1x = exp_player_queue_x;
    q1y = exp_player_queue_y;
    q1w = exp_player_queue_width;

    qc0w = reg_player_queue_ctrls_width;
    qc1w = exp_player_queue_ctrls_width;

    qcc0l = reg_player_queue_ctrls_width - 77;
    qcc1l = exp_player_queue_ctrls_width - 77;

    pqb0h = (window.innerHeight - 620);
    pqb1h = (window.innerHeight - (620 - player_queue_height_diff));
  }

  var e = document.getElementById('player_device');
  var q = document.getElementById('player_queue');
  var qc = document.getElementById('player_queue_ctrls');
  var qcc = document.getElementById('player_queue_ctrls_clear_btn');
  var pqb = document.getElementById('player_queue_body');

  e.style.zIndex = '10';

  function iter(j) {
    if (j<1.0) {
      const jz = 1.0 - j;
      e.style.left = (jz*a0x + j*a1x) + 'px';
      e.style.top = (jz*a0y + j*a1y) + 'px';

      q.style.left = (jz*q0x + j*q1x) + 'px';
      q.style.top = (jz*q0y + j*q1y) + 'px';
      q.style.width = (jz*q0w + j*q1w) + 'px';

      qc.style.width = (jz*qc0w + j*qc1w) + 'px';
      qcc.style.left = (jz*qcc0l + j*qcc1l) + 'px';
      pqb.style.height = (jz*pqb0h + j*pqb1h) + 'px';
      setTimeout(function () { iter(j+0.04); },3);
    } else {
      e.style.left = a1x + 'px';
      e.style.top = a1y + 'px';
      if (state.player.device) {
        state.player.device.width = b1;
      }

      q.style.left = q1x + 'px';
      q.style.top = q1y + 'px';
      q.style.width = q1w + 'px';

      qc.style.width = qc1w + 'px';
      qcc.style.left = qcc1l + 'px';

      pqb.style.height = pqb1h + 'px';

      state.queue.visible = true;
      write_player_queue();
      update_ctrls_underlight(state.player.status());
      write_album_detail();
      state.player.in_flight = false;
    }
  }

  iter(0.0);

  state.player.expanded = !state.player.expanded;

  document.getElementById('index').style.visibility = (state.player.expanded ? 'hidden' : 'visible');
}


////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////


function do_onresize() {
  state.workspace.height = window.innerHeight - adspace_consts.adspace_ht + 3;
  const s = state.workspace.height + 'px';
  document.getElementById('index').style.height = s;
  document.getElementById('workspace').style.height = s;
  document.getElementById('player_queue_body').style.height = (window.innerHeight - (620 - (state.player.expanded ? player_queue_height_diff : 0))) + 'px';
  document.getElementById('player_expand_btn').style.top = (window.innerHeight - 96) + 'px';
}



////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////


