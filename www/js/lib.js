//   Project: https://github.com/realsporkman/aquatic-mp
//   File:    /www/js/lib.js
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

let lib_base = {};

let  fs = {};
let  libpath = {};
let  libchproc = {};
let  libcrypto = {};


//
// General Utils
//


lib_base.val_default = function (v,default_val) {
  return (typeof v  !== 'undefined' ? v : default_val);
}


lib_base.jssert = function (condition, msg) {
  if (!condition) {
    msg = lib_base.val_default(msg,condition);
    console.log('Internal Error: ' + msg);
    throw new Error(msg);
  }
}


lib_base.copy_props = function (thisObj, otherObj) {
  for (const k in otherObj) {
    thisObj[k] = otherObj[k];
  }
}


lib_base.obj_to_string = function (obj) {
  let res = '{';
  var first = true;
  for (const k in obj) {
    if (!first) {
      res += ', ';
    }
    res += '"' + k + '":"' + obj[k] + '"';
    first = false;
  }
  res += '}';
  return res;
}


lib_base.array_loop = function (arr, elemFcn) {
  const sz = arr.length;
  for (let i=0; i<sz; ++i) {
    elemFcn(arr,i);
  }
}


lib_base.console_log = function (msg) {
  console.log(msg);
}


//
// File utils
//


lib_base.path_exists = function (path) {
  return fs.existsSync(path);
}


lib_base.path_is_directory = function (path) {
  return fs.lstatSync(path).isDirectory();
}


//
//  Returns attrs:
//
//         is_directory:  boolean
//         is_symlink:    boolean
//         is_executable: boolean
//         mod_time_ms:    last modified time, in milliseconds (can process w/ "Date")
//
lib_base.get_path_attrs = function (path) {
  const stat = fs.lstatSync(path);
  let attrs = {};
  attrs.is_directory  = (stat.isDirectory()) ? true : false;
  attrs.is_symlink    = (stat.isSymbolicLink()) ? true : false;
  attrs.is_executable = (stat.mode & 0o111) ? true : false;
  attrs.mod_time_ms   = stat.mtimeMs;
  return attrs;
}


lib_base.path_join = function (path, file) {
  return (path + '/' + file);
}

lib_base.path_basename_alt = function (path) {
  return new String(path).substring(path.lastIndexOf('/') + 1);
}


let lib_html = {};


lib_html.escape_for_html = function (str) {
  let res = '';
  for (let i=0; i<str.length; ++i) {
    switch (str[i]) {
      case '<': res += '&#60;'; break;
      case '>': res += '&#62;'; break;
      case '&': res += '&#38;'; break;
      case '"': res += '&#34;'; break;
      case ',': res += '&#44;'; break;
      case '?': res += '&#63;'; break;
      case ' ': res += '&#32;'; break;
      case '#': res += '&#35;'; break;
      case '(': res += '&#40;'; break;
      case ')': res += '&#41;'; break;
      case '!': res += '&#33;'; break;
      case '+': res += '&#43;'; break;
      case '$': res += '&#36;'; break;
      case '%': res += '&#37;'; break;
      case '@': res += '&#64;'; break;
      case '[': res += '&#91;'; break;
      case ']': res += '&#93;'; break;
      case '^': res += '&#94;'; break;
      default: res += str[i];
    };
  }

  return res;
}


lib_html.img_tag = function (path, alt, w, h, misc) {
  let res = '<img src=".' + lib_html.escape_for_html(path) + '"';
  if (alt) {
    res += ' alt="' + alt + '"';
  }
  if (w) {
    res += ' width="' + w + '"';
  }
  if (h) {
    res += ' height="' + h + '"';
  }
  if (misc) {
    res += ' ' + misc;
  }
  res += '>';
  return res;
}


lib_html.song_tag = function (path,id,is_video,w) {
  let res = '';
  if (is_video) {
    res += '<video src=".' + lib_html.escape_for_html(path) + '" id="' + id + '" class="video_player" width="' + w + '" controls autoplay></video>';
  } else {
    res += '<audio src=".' + lib_html.escape_for_html(path) + '" id="' + id + '" class="audio_player" width="' + w + '" controls autoplay></audio>';
  }
  return res;
}


lib_html.open_ = function (str) { return ('<' + str + '>'); }
lib_html.close = function (str) { return ('</' + str + '>'); }

lib_html.inwrite_mtx = {};
lib_html.infade_mtx = {};


lib_html.write = function (id, html, on_resume, fade_in_s = 0, fade_out_s = 0) {
  if (lib_html.inwrite_mtx[id]) {
    return;
  }
  lib_html.inwrite_mtx[id] = true;
  const e = document.getElementById(id);
  lib_base.jssert(e);
  if (fade_out_s>0.0001) {
    lib_html.fade(id,fade_out_s,false,1.0);
    setTimeout(fade_in,fade_out_s*1000);
  } else {
    e.style.opacity = 0;
    e.style.visibility = 'hidden';
    fade_in();
  }
  var fade_in_flag = false;
  function fade_in() {
    if (lib_html.infade_mtx[id]) {
      setTimeout(fade_in,4);
      return;
    }
    e.style.visibility = 'visible';
    if (!e.style.opacity) {
      e.style.opacity = 0;
    }
    if (e.style.opacity==0) {
      fade_in_flag = true;
    }
    if (fade_in_flag) {
      e.innerHTML = html;
      if (fade_in_s>0.0001) {
        lib_html.fade(id,fade_in_s,true,1.0);
      } else {
        e.style.opacity = 1;
      }
    } else {
      setTimeout(fade_in,4);
    }
  }

  function fresume() {
    if (!lib_html.infade_mtx[id] && e.style.opacity==1) {
      lib_html.inwrite_mtx[id] = false;
      on_resume();
    } else {
      setTimeout(fresume,4);
    }
  }

  setTimeout(fresume,(fade_in_s+fade_out_s) * 1000);
}


// Elapse = total time in seconds
lib_html.fade = function (id, elapse, is_fadein, max_opacity, on_complete = function () {}) {
  if (lib_html.infade_mtx[id]) {
    return;
  }
  lib_html.infade_mtx[id] = true;
  const e = document.getElementById(id);
  lib_base.jssert(e);
  let o;
  o = (is_fadein ? 0.0 : max_opacity);
  lib_base.jssert(elapse>0.0001);
  const incr = (is_fadein ? 1 : -1) * max_opacity/(elapse*50);
  const max_o = max_opacity + 0.000001;
  function op_itr() {
    if (-0.000001<o && o<max_o) {
      e.style.opacity = o.toString();
      o += incr;
      setTimeout(op_itr,20);
    } else {
      e.style.opacity = (is_fadein ? max_opacity : 0.0);
      lib_html.infade_mtx[id] = false;
      on_complete();
    }
  }
  setTimeout(op_itr, 20);
}


let lib_struct = {};


lib_struct.Container = class {

  constructor(key,title,id) {
    this.size = 0;
  }
};


//
// Linked list
//
//   this:
//         size:  size
//         first: first link
//         last:  last link
//   link:
//         e:   data payload obj
//         nxt: next link
//         prv: previous link
//
lib_struct.LinkedList = class extends lib_struct.Container {

  constructor() {
    super();
  }

  push_back(e) {
    if ('first' in this) {
      const lnk = { 'e' : e, 'prv' : this.last };
      this.last.nxt = lnk;
      this.last = lnk;
    } else {
      this.last = this.first = { 'e' : e };
    }

    this.size += 1;
  }

  erase(itr) {
    lib_base.jssert(this.first);
    if (itr.prv) {
      itr.prv.nxt = itr.nxt;
    } else {
      lib_base.jssert(this.first==itr);
      if (itr.nxt) {
        this.first = itr.nxt;
      } else {
        delete this.first;
      }
    }
    if (itr.nxt) {
      itr.nxt.prv = itr.prv;
    } else {
      lib_base.jssert(this.last==itr);
      if (itr.prv) {
        this.last = itr.prv;
      } else {
        delete this.last;
      }
    }

    this.size -= 1;
  }

  move_forward(itr) {
    lib_base.jssert(this.first);
    if (itr.prv) {
      const prv = itr.prv;
      const prvprv = prv.prv;
      const nxt = itr.nxt;

      if (prv==this.first) {
        this.first = itr;
        delete itr.prv;
      } else {
        lib_base.jssert(prvprv);
        prvprv.nxt = itr;
        itr.prv = prvprv
      }

      if (itr==this.last) {
        this.last = prv;
        delete prv.nxt;
      } else {
        lib_base.jssert(nxt);
        nxt.prv = prv;
        prv.nxt = nxt
      }

      itr.nxt = prv;
      prv.prv = itr;
    }
  }

  clear() {
    delete this.first;
    delete this.last;
    this.size = 0;
  }
};
