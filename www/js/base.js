//   Project: https://github.com/realsporkman/aquatic-mp
//   File:    /www/js/base.js
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


//  mutex_wrap(state.queue.mutex, l, function (lnk) {
//    // code
//  });
function mutex_wrap(mtx, arg, fcn) {
  if (mtx) {
    return;
  }
  mtx = true;

  fcn(arg);

  mtx = false;
}


function get_ith_map_key(map_obj,i) {
  if (!(Object.keys(map_obj).length>i)) {
    alert('sz=' + map_obj.size + '  i=' + i);
    lib_base.jssert(0);
  }
  var j = 0;
  for (const k in map_obj) {
    if (j==i) {
      return k;
    }
    ++j;
  }
  lib_base.jssert(0);
}


var events = {
  onclick: {},
  onmouseover: {},
  onmouseout: {}
}


// [0,1)
function rand_float() {
  var x = Math.random();
  while (x>=1.0) {
    x = Math.random();
  }
  return x;
}


function rand_int(maxval_plus_one) {
  var res = Math.floor(Math.random() * maxval_plus_one);
  if (res>=maxval_plus_one-0.5) {
    res = maxval_plus_one - 1;
  }
  return res;
}


function scale_dimension(old_t,old_result,new_t) {
  lib_base.jssert(old_t>0);
  return Math.floor( (old_result * new_t) / old_t );
}




//
// Main entryway
//

function exec1(top_fcn) {
  try {
    top_fcn();
  }
  catch (e) {
    const msg = e.name + ': ' + e.message + ' - ' + e.fileName + ':' + e.lineNumber + ':' + e.columnNumber + '\n\n' + e.stack;
    alert(msg);
  }
  finally {}
}

function exec2(top_fcn,a) {
  try {
    top_fcn(a);
  }
  catch (e) {
    const msg = e.name + ': ' + e.message + ' - ' + e.fileName + ':' + e.lineNumber + ':' + e.columnNumber + '\n\n' + e.stack;
    alert(msg);
  }
  finally {}
}

//
//
//



class MediaObj {

  constructor() {
  }

  toString() {
    return lib_base.obj_to_string(this);
  }
};


class Song extends MediaObj {

  constructor(attrs) {
    super();
    lib_base.copy_props(this,attrs);
  }

};


class Video extends MediaObj {

  constructor(attrs) {
    super();
    lib_base.copy_props(this,attrs);
  }

};


class Album extends MediaObj {

  constructor(attrs) {
    super();
    lib_base.copy_props(this,attrs);
  }

};


class CoverImg extends MediaObj {

  constructor(attrs) {
    super();
    lib_base.copy_props(this,attrs);
  }

};


class MediaDB extends MediaObj {

  constructor(attrs) {
    super();
    lib_base.copy_props(this,attrs);
  }

};


class IndexLink {

  constructor(key,title,id) {
    this.key = key;
    this.title = title;
    this.id = id;
  }
};


class AdImg extends MediaObj {

  constructor(attrs) {
    super();
    lib_base.copy_props(this,attrs);
    this['is_ad'] = '1';
  }

};



