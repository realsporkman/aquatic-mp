//   Project: https://github.com/realsporkman/aquatic-mp
//   File:    /www/js/adspace.js
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

const adspace_consts = {
  adspace_ht: 128,
  panel_wh: 120,
  ad_w: 214,
  fade_time_s: 2.0,
  opacity: 0.93,
  ad_prob: 0.018,
  ad_iter_s: 20
};

state.adspace = {};

function write_adspace() {

  var res = '';

  // Initialize adspace banner
  document.getElementById('adspace').style.height = adspace_consts.adspace_ht + 'px';
  const panel_margin = (adspace_consts.adspace_ht - adspace_consts.panel_wh) / 2;
  const ad_margin = (2*adspace_consts.adspace_ht - adspace_consts.ad_w) / 2;
  for (var i=0; i<9; ++i) {
    const x = panel_margin + adspace_consts.adspace_ht*i;
    var e = document.getElementById('adsp_panel' + i + '0');
    e.style.left = x + 'px';
    e.style.opacity = 0;
    e = document.getElementById('adsp_panel' + i + '1');
    e.style.left = x + 'px';
    e.style.opacity = 0;
    if (i<8) {
      const x2 = ad_margin + adspace_consts.adspace_ht*i;
      e = document.getElementById('adsp_ad' + i + '0');
      e.style.left = x2 + 'px';
      e.style.opacity = 0;
      e = document.getElementById('adsp_ad' + i + '1');
      e.style.left = x2 + 'px';
      e.style.opacity = 0;
    }
  }

  // panels: array of 9 squares,1 each for an album img or 2 for a full ad
  state.adspace['panels'] = [];
  // panel_ads_avail: set of albums available for an ad panel
  state.adspace['panel_ads_avail'] = {};
  // full_ads_avail: set of full ads available for two adjacent ad panels
  state.adspace['full_ads_avail'] = {};

  // Populate panel_ads_avail set w/ albums that are available for an ad
  // (that aren't already displayed in an ad, and that have a cover img)
  lib_base.array_loop(db.albums_w_covers, function (albums, i) {
    lib_base.jssert(id_map[albums[i]].is_album=='1');
    state.adspace['panel_ads_avail'][albums[i]] = '';
  });

  // Populate full_ads_avail set w/ available ads
  // (that aren't already displayed)
  lib_base.array_loop(db.ads, function (ads, i) {
    lib_base.jssert(ads[i].is_ad=='1');
    state.adspace['full_ads_avail'][ads[i].id] = '';
  });

  // Initialize the 9 panel objects
  for (var i=0; i<9; ++i) {
    const p = {
      img: null,    // Img id
      div_idx: '1'  // Active of 2 panels divs ('0' or 1')
    };

    state.adspace.panels.push(p);
  }

  var iter_idx = 0;

  // Write initial set of ads
  do {
    iter_idx = write_random_ad(iter_idx);
  } while (iter_idx>0);

  // Launch recurring ad update
  function ad_iter () {
    exec1(function () {
      iter_idx = write_random_ad(iter_idx);
    });
    setTimeout(ad_iter,adspace_consts.ad_iter_s * 1000);
  }

  setTimeout(ad_iter,adspace_consts.ad_iter_s * 1000);
}


function get_random_img(ad_ok) {
  var r = ad_ok ? rand_float() : 1.001;
  if (r<adspace_consts.ad_prob && Object.keys(state.adspace['full_ads_avail']).length>0) {
    r = rand_int(Object.keys(state.adspace['full_ads_avail']).length);
    return get_ith_map_key(state.adspace['full_ads_avail'],r);
  } else if (Object.keys(state.adspace['panel_ads_avail']).length>0) {
    r = rand_int(Object.keys(state.adspace['panel_ads_avail']).length);
    return get_ith_map_key(state.adspace['panel_ads_avail'],r);
  } else {
    return -1;
  }
}


function get_img_info(idx,img,div_idx) {
  var info = {};
  var img;
  var obj;
  var is_ad;
  var panel_id;
  obj = id_map[img];
  if (obj) {
    is_ad = (obj.is_ad ? true : false);
    panel_id = (is_ad ? 'adsp_ad' : 'adsp_panel') + idx + div_idx;
  }
  info['img'] = img;
  info['obj'] = obj;
  info['is_ad'] = is_ad;
  info['panel_id'] = panel_id;
  info['idx'] = idx;
  return info;
}


function write_random_ad(iter_idx, is_first = true) {

  const panel = state.adspace.panels[iter_idx];
  if (typeof panel === 'undefined') {
    return -1;
  }
  const nxt_idx = ((iter_idx+1)%9);
  const nxt_panel = state.adspace.panels[nxt_idx];
  const old_info_p1 = get_img_info(nxt_idx,nxt_panel.img,nxt_panel.div_idx);

  // The other panel div will become activated
  const new_div_idx = (panel.div_idx=='1' ? '0' : '1');

  var old_img, old_info;

  if (is_first) {
    old_img = panel.img;
    old_info = get_img_info(iter_idx,old_img,panel.div_idx);
  }

  const new_img = get_random_img(iter_idx<8 && !old_info_p1.is_ad && is_first);
  if (new_img==-1) {
    return -1;
  }
  const new_info = get_img_info(iter_idx,new_img,new_div_idx);

  lib_base.jssert(new_info.obj);

  // Return old img to *_ads_avail, remove new_img
  if (is_first && old_img) {
    if (old_info.is_ad) {
      state.adspace['full_ads_avail'][old_info.img] = '';
    } else {
      state.adspace['panel_ads_avail'][old_info.img] = '';
    }
  }

  const e_id = new_info.panel_id;
  const e = document.getElementById(e_id);
  lib_base.jssert(e);

  const basenm = lib_base.path_basename_alt(new_info.obj.path);

  if (new_info.is_ad) {

    delete state.adspace['full_ads_avail'][new_info.img];

    const alt = basenm.substring(0,basenm.length-4);
    const res = '<div class="adsp_ad_back" style="left: -15px"></div>' +
                lib_html.img_tag(new_info.obj.path,alt,adspace_consts.ad_w,'class="adsp_ad" title="' + alt + '"');

    new_info['html_img'] = res;

  } else {

    lib_base.jssert(new_info.obj.is_album);

    delete state.adspace['panel_ads_avail'][new_info.img];

    new_info['html_img'] = lib_html.img_tag(new_info.obj.covers[0].path,basenm,adspace_consts.panel_wh,adspace_consts.panel_wh,'class="adsp_cover" title="' + basenm + '"');

  }

  // Update panel
  panel.img = new_img;
  panel.div_idx = new_div_idx;

  if (e.style.opacity>0) {
    e.style.opacity = 0;
  }

  // Write the new image to the panel's html
  e.innerHTML = new_info.html_img;

  var ret_val;

  if (is_first && old_info.is_ad) {

    const id = old_info.panel_id;

    lib_html.fade(id,adspace_consts.fade_time_s,false,adspace_consts.opacity,function () {
                                                                           var x = document.getElementById(id);
                                                                           x.style.zIndex = 0;
                                                                           x.onclick = null});

    if (new_info.is_ad) {

      ret_val = ((nxt_idx+1)%9);

    } else {

      ret_val = write_random_ad(nxt_idx,false);

    }

  } else {

    if (is_first && old_info.panel_id) {
      const id = old_info.panel_id;
      lib_html.fade(id,adspace_consts.fade_time_s,false,adspace_consts.opacity,function () {
                                                                             var x = document.getElementById(id);
                                                                             x.style.zIndex = 0;
                                                                             x.onclick = null});
    }

    if (new_info.is_ad) {

      lib_base.jssert(!old_info_p1.is_ad);
      if (old_info_p1.panel_id) {
        const id = old_info_p1.panel_id;
        lib_html.fade(id,adspace_consts.fade_time_s,false,adspace_consts.opacity,function () {
                                                                               var x = document.getElementById(id);
                                                                               x.style.zIndex = 0;
                                                                               x.onclick = null});
      }

      ret_val = ((nxt_idx+1)%9);

    } else {

      ret_val = nxt_idx;

    }

  }

  const obj = new_info.obj;

  lib_html.fade(new_info.panel_id,adspace_consts.fade_time_s,true,adspace_consts.opacity,function () {
                                                                                       var x = document.getElementById(e_id);
                                                                                       x.style.zIndex = 10;
                                                                                       const o = obj;
                                                                                       if (!o.is_ad) {
                                                                                         x.onclick = function () { launch_album_detail(o); }
                                                                                       }
                                                                                       x.onmouseover = function () {
                                                                                         if (x.style.opacity==adspace_consts.opacity) {
                                                                                           x.style.opacity = 1;
                                                                                         }
                                                                                       }
                                                                                       x.onmouseout = function () {
                                                                                         mutex_wrap(lib_html.infade_mtx[new_info.idx],x,function () {
                                                                                           if (x.style.opacity==1) {
                                                                                             x.style.opacity = adspace_consts.opacity;
                                                                                           }
                                                                                         });
                                                                                       }
                                                                                     });

  return ret_val;
}


