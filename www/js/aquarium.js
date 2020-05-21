//   Project: https://github.com/realsporkman/aquatic-mp
//   File:    /www/js/aquarium.js
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


state.aquarium.objects = {};

state.aquarium.enabled = false;
state.aquarium.active = false;
state.aquarium.iter = 0;
state.aquarium.id_cnt = 0;
state.aquarium.tck = 0;

state.aquarium.objects.bubbles = [];
state.aquarium.objects.ytangs = [];
state.aquarium.objects.btangs = [];
state.aquarium.objects.angelfish = [];
state.aquarium.objects.anemonefish = [];
state.aquarium.objects.localfish = [];
state.aquarium.objects.images = [];
state.aquarium.objects.reefobjs = [];
state.aquarium.objects.crabs = [];




const aqua_consts = {
  max_x: 847,
  r_bubble_new: 0.0028,
  r_ytang_new: 0.0009,
  r_ytang_turn: 0.00004,
  r_btang_new: 0.00029,
  r_btang_turn: 0.00003,
  r_angelfish_new: 0.0003,
  r_angelfish_turn: 0.2,
  r_anemonefish_new: 0.00006,
  r_anemonefish_del: 0.00034,
  r_anemonefish_turn: 0.001,
  r_localfish_new: 0.0005,
  r_localfish_del: 0.00037,
  r_localfish_turn: 0.001,
  r_reefobj_new: 0.00092,
  r_reefobj_del: 0.00020,
  r_crab_new: 0.00005,
  r_crab_del: 0.00051,
  r_crab_turn: 0.0032
};




function launch_aquarium() {

  if (!state.aquarium.enabled) {
    return;
  }

  ++state.aquarium.iter;
  var iter_id = state.aquarium.iter;

  draw_aqua();

  function aqua_proc() {

    if (!state.aquarium.enabled || iter_id!=state.aquarium.iter) {
      return;
    }

    exec1(do_aqua_iter);

    setTimeout(aqua_proc,30);
  }

  aqua_proc();
}


class AquaObj {
  constructor(id) {
    this.id = id;
    this.elem = null;
  }

  setNewElemBase0() {
    this.elem = document.createElement('img');
    lib_base.jssert(this.elem);
    this.elem.id = this.id;
    this.elem.classList.add('aqua_obj');
    this.elem.src = this.img;
    set_obj_coord(this.elem,this.x,this.y);
  }
};


// Static image
class Image extends AquaObj {
  constructor(img,id,x,y) {
    super(id);
    this.img = img;
    this.x = x;
    this.y = y;
  }

  setNewElem() {
    this.setNewElemBase();
  }

  setNewElemBase() {
    this.setNewElemBase0();
    this.elem.classList.add('aqua_img');
  }
};


class ReefObj extends Image {
  constructor(id) {
    var img, w;
    var y = 27;
    //switch(rand_int(1)) {
    switch(rand_int(8)) {
    case 0:
        img = 'aquarium/clam0.png';
        w = 70;
        y = 23;
        break;
    case 1:
        img = 'aquarium/seagrass0.png';
        w = 50;
        break;
    case 2:
        img = 'aquarium/sponge0.png';
        w = 32;
        break;
    case 3:
        img = 'aquarium/sponge1.png';
        w = 54;
        break;
    case 4:
        img = 'aquarium/sponge2.png';
        w = 60;
        break;
    case 5:
        img = 'aquarium/sponge3.png';
        w = 72;
        break;
    case 6:
        img = 'aquarium/reef0.png';
        w = 128;
        break;
    case 7:
        img = 'aquarium/plant0.png';
        w = 64;
        break;
    default:
        lib_base.jssert(0);
    }
    const x = rand_int(aqua_consts.max_x - w);
    super(img,id,x,y);
    this.w = w;
  }

  setNewElem() {
    this.setNewElemBase();
    this.elem.width = this.w;
    this.elem.classList.add('reef_obj');
  }
};


class Bubble extends AquaObj {

  constructor(id) {
    super(id);
    this.img = 'aquarium/bubble.png';
    this.x = rand_int(aqua_consts.max_x);
    this.y = 0;
    this.dy = 0.20 * rand_float() + 0.20;
    this.dx = 0.24 * rand_float();
    this.ddx = 0.00050 * rand_float() + 0.00050;
    this.dx_sgn = rand_int(2) ? true : false;
  }

  setNewElem() {
    this.setNewElemBase0();
    this.elem.width = 7;
    this.elem.height = 7;
    this.elem.classList.add('bubbles');
  }
};


class Fish extends AquaObj {
  constructor(id) {
    super(id);
  }

  setNewElem() {
    this.setNewElemBase0();
    this.elem.width = this.w;
    this.elem.height = this.h;
    this.elem.style.visibility = 'hidden';
    this.is_new = 2;
  }

  flip_dir() {
    this.set_dir(!this.dir);
    this.dx = -this.dx;
  }

};


// Yellow Tang
class Ytang extends Fish {

  constructor(id) {
    super(id);
    this.w = 52;
    this.h = 34;
    this.set_dir(rand_int(2));
    if (this.dir) {
      this.x = aqua_consts.max_x-this.w;
      this.dx = -0.27;
    } else {
      this.x = 0;
      this.dx = 0.27;
    }
    this.dy = 8 + rand_int(7);
    var tp = 0.1 * state.workspace.height;
    this.y = rand_int(state.workspace.height - 3.2*tp) + tp + this.dy;
  }

  set_dir(d) {
    this.dir = d;
    if (d) {
      this.img = 'aquarium/ytang_r.png';
    } else {
      this.img = 'aquarium/ytang.png';
    }
  }
};


// Blue Tang
class Btang extends Fish {

  constructor(id) {
    super(id);
    this.w = 80;
    this.h = 37;
    this.set_dir(rand_int(2));
    if (this.dir) {
      this.x = aqua_consts.max_x-this.w;
      this.dx = -(0.31 + 0.11*rand_float());
    } else {
      this.x = 0;
      this.dx = 0.31 + 0.11*rand_float();
    }
    const tp = 0.1 * state.workspace.height;
    this.y = rand_int(state.workspace.height - 3*tp) + tp;
  }

  set_dir(d) {
    this.dir = d;
    if (d) {
      this.img = 'aquarium/btang_r.png';
    } else {
      this.img = 'aquarium/btang.png';
    }
  }
};


// Angelfish
class Angelfish extends Fish {

  constructor(id) {
    super(id);
    this.w = 50;
    this.h = 0.7*this.w;
    this.type = rand_int(3);
    this.dir_orig = rand_int(2);
    this.set_dir(this.dir_orig);
    if (this.dir) {
      this.x = aqua_consts.max_x-this.w;
      this.dx = -(0.19 + 0.09*rand_float());
    } else {
      this.x = 0;
      this.dx = (0.19 + 0.09*rand_float());
    }
    this.x_o = this.x;
    this.dx_o = this.dx;
    const tp = 0.1 * state.workspace.height;
    this.y = this.y0 = rand_int(state.workspace.height - 3*tp) + tp;
    this.y1 = rand_int(state.workspace.height - 4*tp) + 2*tp;
    this.do_flip = (rand_float()<aqua_consts.r_angelfish_turn);
    const tpx = 0.2 * aqua_consts.max_x;
    this.x_mid = tpx + rand_int(aqua_consts.max_x-2*tpx);
    if (this.y0>this.y1) {
      this.yd = (this.y0-this.y1)/2.0;
      this.yb = this.y1;
      this.ym = this.y0;
    } else {
      this.yd = (this.y1-this.y0)/2.0;
      this.yb = this.y0;
      this.ym = this.y1;
    }
  }

  set_dir(d) {
    this.dir = d;
    this.img = 'aquarium/angelfish' + this.type;
    if (d) {
      this.img += '_r.png';
    } else {
      this.img += '.png';
    }
  }
};


// Anemonefish
class AnemoneFish extends Fish {

  constructor(id) {
    super(id);

    if (rand_int(2)) {
      this.ane_img = 'aquarium/anemone1.png';
      this.ane_w = 106;
      this.ane_h = 0.578*this.ane_w;
    } else {
      this.ane_img = 'aquarium/anemone5.png';
      this.ane_w = 100;
      this.ane_h = 0.596*this.ane_w;
    }
    this.ane_elem = null;
    this.ane_y = 22;
    this.ane_x = rand_int(aqua_consts.max_x - this.ane_w);

    this.w = 44;
    this.h = 0.542*this.w;
    this.x0 = this.ane_x - (100 + rand_int(40));
    this.x1 = this.ane_x + this.ane_w + (100 + rand_int(40)) - this.w;
    const d = this.x1 - this.x0;
    if (this.x0<0) {
      this.x0 = 0;
      this.x1 = d;
    } else if (this.x1>aqua_consts.max_x-this.w) {
      this.x0 = aqua_consts.max_x-this.w-d;
      this.x1 = aqua_consts.max_x-this.w
    }
    this.set_dir(rand_int(2));
    if (this.dir) {
      this.dx = -(0.14 + 0.09*rand_float());
    } else {
      this.dx = 0.14 + 0.09*rand_float();
    }
    this.x = this.ane_x + rand_float()*this.ane_w;
    this.y = 40 + rand_int(60);
    this.dy = 0 + rand_int(6);
  }

  set_dir(d) {
    this.dir = d;
    if (d) {
      this.img = 'aquarium/anemonefish0_r.png';
    } else {
      this.img = 'aquarium/anemonefish0.png';
    }
  }

  setNewElemAne() {
    this.ane_elem = document.createElement('img');
    lib_base.jssert(this.ane_elem);
    this.ane_elem.id = this.id + '_ane';
    this.ane_elem.classList.add('aqua_obj');
    this.ane_elem.classList.add('anemone');
    this.ane_elem.src = this.ane_img;
    set_obj_coord(this.ane_elem,this.ane_x,this.ane_y);
    this.ane_elem.width = this.ane_w;
    this.ane_elem.height = this.ane_h;
  }


  publ_aqua_obj_ane() {
    this.setNewElemAne();
    const e = state.aquarium.elem.appendChild(this.ane_elem);
    lib_base.jssert(e==this.ane_elem);
  }
};


class LocalFish extends Fish {

  constructor(id) {
    super(id);
    this.w = 50;
    this.h = 0.570*this.w;
    this.set_dir(rand_int(2));
    if (this.dir) {
      this.x = aqua_consts.max_x-this.w;
      this.dx = -(0.16 + 0.07*rand_float());
    } else {
      this.x = 0;
      this.dx = (0.16 + 0.07*rand_float());
    }
    this.y1 = 0.16 * state.workspace.height;
    this.y = this.y0 = 53;
    this.yd = (this.y1-this.y0);
    this.f0 = 440.0;
    this.f1 = 1320.0;
    this.r00 = rand_float()*3.14;
    this.r01 = 0.2*rand_float()*this.f0;
    this.r10 = rand_float()*3.14;
    this.r11 = 0.2*rand_float()*this.f1;
  }

  set_dir(d) {
    this.dir = d;
    if (d) {
      this.img = 'aquarium/flameangel_r.png';
    } else {
      this.img = 'aquarium/flameangel.png';
    }
  }
};


class Crawler extends AquaObj {
  constructor(img,id,x,y) {
    super(id);
    this.img = img;
    this.x = x;
    this.y = y;
    this.set_dir(rand_int(2));
  }

  setNewElemBase() {
    this.setNewElemBase0();
    this.elem.width = this.w;
  }

  flip_dir() {
    this.set_dir(!this.dir);
    this.dx = -this.dx;
  }

};


class Crab extends Crawler {
  constructor(id) {
    var img, w;
    switch(rand_int(1)) {
    case 0:
        img = 'aquarium/crab0.png';
        w = 50;
        break;
    default:
        lib_base.jssert(0);
    }
    const x = rand_int(aqua_consts.max_x - w);
    const y = 20;
    super(img,id,x,y);
    this.w = w;
    if (this.dir) {
      this.dx = -0.20;
    } else {
      this.dx = 0.20;
    }
  }

  setNewElem() {
    this.setNewElemBase();
    this.elem.classList.add('crab');
  }

  set_dir(d) {
    this.dir = d;
  }
};


function get_aqua_id(prfx) {
  const res = prfx + state.aquarium.id_cnt;
  state.aquarium.id_cnt = (state.aquarium.id_cnt+1) % (0xfffffff)
  return res;
}


function set_obj_coord(e,x,y) {
  e.style.left = x + 'px';
  e.style.bottom = y + 'px';
}


function rm_from_aquarium(obj) {
  if (obj && obj.parentNode==state.aquarium.elem) {
    state.aquarium.elem.removeChild(obj);
  }
}

function publ_aqua_obj(obj) {
  obj.setNewElem();
  const e = state.aquarium.elem.appendChild(obj.elem);
  lib_base.jssert(e==obj.elem);
}


function add_aqua_obj(v,obj) {
  v.push(obj);
  publ_aqua_obj(obj);
}


function rm_aqua_obj(v,i) {
  const obj = v.splice(i,1)[0];
  if (obj) {
    rm_from_aquarium(obj.elem);
  }
}


function do_aqua_iter() {

  function task_by_type(vec,modfcn,newfcn) {
    var del = [];

    lib_base.array_loop(vec, function(v,i) {
      if (modfcn(v[i])) {
        del.push(i);
      }
    });

    var b = newfcn();
    if (b) {
      add_aqua_obj(vec,b);
    }

    lib_base.array_loop(del, function(v,i) {
      rm_aqua_obj(vec,v[i]);
    });
  }

  task_by_type(state.aquarium.objects.reefobjs,function (b) {
      if (rand_float()<aqua_consts.r_reefobj_del) {
        return 1;
      }
      return 0;
    },
    function () {
      if (rand_float()<aqua_consts.r_reefobj_new) {
        return new ReefObj(get_aqua_id('ro'));
      }
      return null;
    });

  task_by_type(state.aquarium.objects.bubbles,function (b) {
      if (b.y>state.workspace.height) {
        return 1; // Delete
      }
      b.y += b.dy;
      if (b.dx_sgn) {
        b.x -= b.dx;
      } else {
        b.x += b.dx;
      }
      b.dx -= b.ddx;
      if (b.dx<0.0) {
        b.dx = 0;
      }
      set_obj_coord(b.elem,b.x,b.y);
      return 0;
    },
    function () {
      if (rand_float()<aqua_consts.r_bubble_new) {
        return new Bubble(get_aqua_id('bub'));
      }
      return null;
    });

  task_by_type(state.aquarium.objects.crabs,function (b) {
      if (b.x+b.w>aqua_consts.max_x || b.x<0 || rand_float()<aqua_consts.r_crab_del) {
        return 1;
      }
      if (rand_float()<aqua_consts.r_crab_turn) {
        b.dx = -b.dx;
      }
      b.x += b.dx;
      set_obj_coord(b.elem,b.x,b.y);
      return 0;
    },
    function () {
      if (rand_float()<aqua_consts.r_crab_new) {
        return new Crab(get_aqua_id('crb'));
      }
      return null;
    });

  function flipBasic(b) {
    lib_base.jssert(b);
    lib_base.jssert(b.elem);
    rm_from_aquarium(b.elem);
    b.flip_dir();
    publ_aqua_obj(b);
  }

  function flipBase(b,do_flip) {
    if (b.is_new) {
      // Delays visibility for a few ticks
      --b.is_new;
      if (b.is_new==0) {
        b.elem.style.visibility = 'visible';
      }
    }
    if (do_flip) {
      flipBasic(b);
      return true;
    }
    return false;
  }

  function fishFlip(b,p) {
    return flipBase(b,rand_float()<p);
  }

  task_by_type(state.aquarium.objects.ytangs,function (b) {
      if (b.y>state.workspace.height || b.y<-b.h ||
          b.x+b.w>aqua_consts.max_x || b.x<0) {
        return 1; // Delete
      }
      if (!fishFlip(b,aqua_consts.r_ytang_turn)) {
        b.x += b.dx;
        const y = b.y + b.dy*Math.sin(b.x/30.0);
        set_obj_coord(b.elem,b.x,y);
      }
      return 0;
    },

    function () {
      if (rand_float()<aqua_consts.r_ytang_new) {
        return new Ytang(get_aqua_id('ytg'));
      }
      return null;
    });

  task_by_type(state.aquarium.objects.btangs,function (b) {
      if (b.y>state.workspace.height || b.y<-b.h ||
          b.x+b.w>aqua_consts.max_x || b.x<0) {
        return 1; // Delete
      }
      if (!fishFlip(b,aqua_consts.r_ytang_turn)) {
        b.x += ( 0.84*b.dx + 0.16*b.dx*(1.0 + Math.sin(state.aquarium.tck/60.0)) );
        set_obj_coord(b.elem,b.x,b.y);
      }
      return 0;
    },
    function () {
      if (rand_float()<aqua_consts.r_btang_new) {
        return new Btang(get_aqua_id('btg'));
      }
      return null;
    });

  task_by_type(state.aquarium.objects.angelfish,function (b) {
      if (b.y>state.workspace.height || b.y<-b.h ||
          b.x+b.w>aqua_consts.max_x || b.x<0) {
        return 1; // Delete
      }
      if (b.is_new) {
        // Delays visibility for a few ticks
        --b.is_new;
        if (b.is_new==0) {
          b.elem.style.visibility = 'visible';
        }
      }
      b.x += b.dx;
      b.x_o += b.dx_o;
      if (b.do_flip && Math.abs(b.x-b.x_mid)<1) {
        flipBasic(b);
        b.do_flip = false;
      }
      function yincr0() {
        var br = b.x_o/b.x_mid;
        if (br<-1.0) {
          br = -1.0;
        } else if (br>1.0) {
          br = 1.0;
        }
        b.y = b.yd * (br*br*br) + b.yb;
      }
      function yincr1() {
        var br = 1.0 - (b.x_o-b.x_mid)/(aqua_consts.max_x-b.x_mid);
        if (br<-1.0) {
          br = -1.0;
        } else if (br>1.0) {
          br = 1.0;
        }
        b.y = b.ym - b.yd * (br*br*br);
      }
      if (b.dir_orig) {
        if (b.x_o<b.x_mid) {
          yincr0();
        } else {
          yincr1();
        }
      } else {
        if (b.x_o<b.x_mid) {
          yincr0();
        } else {
          yincr1();
        }
      }
      set_obj_coord(b.elem,b.x,b.y);
      return 0;
    },
    function () {
      if (rand_float()<aqua_consts.r_angelfish_new) {
        return new Angelfish(get_aqua_id('ang'));
      }
      return null;
    });

  task_by_type(state.aquarium.objects.anemonefish,function (b) {
      if (rand_float()<aqua_consts.r_anemonefish_del) {
        rm_from_aquarium(b.ane_elem);
        return 1; // Delete
      }
      const do_flip = b.x<b.x0 || b.x>b.x1 || rand_float()<aqua_consts.r_anemonefish_turn;
      flipBase(b,do_flip);
      b.x += b.dx;
      const y = b.y + b.dy*Math.sin(state.aquarium.tck/68.0);
      set_obj_coord(b.elem,b.x,y);
      return 0;
    },
    function () {
      if (rand_float()<aqua_consts.r_anemonefish_new) {
        const b = new AnemoneFish(get_aqua_id('ane'));
        b.publ_aqua_obj_ane();
        return b;
      }
      return null;
    });

  task_by_type(state.aquarium.objects.localfish,function (b) {
      if (b.y>state.workspace.height || b.y<-b.h ||
          b.x+b.w>aqua_consts.max_x || b.x<0) {
        return 1; // Delete
      }
      if (!fishFlip(b,aqua_consts.r_localfish_turn)) {
        var f0 = Math.sin(b.r00 + state.aquarium.tck/(b.f0+b.r01));
        f0 *= f0;
        if (f0<0.3) {
          f0 = 0.3;
        }
        var f1 = Math.sin(b.r10 + state.aquarium.tck/(b.f1+b.r11));
        f1 *= f1;

        b.y = b.y0 + b.yd*f0*f1;
        b.x += b.dx;
        set_obj_coord(b.elem,b.x,b.y);
      }
      return 0;
    },
    function () {
      if (rand_float()<aqua_consts.r_localfish_new) {
        return new LocalFish(get_aqua_id('lcf'));
      }
      return null;
    });

  ++state.aquarium.tck;
}


function draw_aqua() {
  state.aquarium.elem = document.getElementById('aquarium');
  lib_base.jssert(state.aquarium.elem);

  // Build static images if not wlaready
  if (state.aquarium.objects.images.length==0) {
    const sandfloor = new Image('aquarium/floor.png',get_aqua_id('img'),-1,-80);
    state.aquarium.objects.images.push(sandfloor);
  }

  lib_base.array_loop(state.aquarium.objects.images, function(images,i) {
    const b = images[i];
    lib_base.jssert(!document.getElementById(b.id));
    publ_aqua_obj(b);
  });

  lib_base.array_loop(state.aquarium.objects.reefobjs, function(reefobjs,i) {
    const b = reefobjs[i];
    lib_base.jssert(!document.getElementById(b.id));
    publ_aqua_obj(b);
  });

  lib_base.array_loop(state.aquarium.objects.bubbles, function(bubbles,i) {
    const b = bubbles[i];
    lib_base.jssert(!document.getElementById(b.id));
    publ_aqua_obj(b);
  });

  lib_base.array_loop(state.aquarium.objects.crabs, function(crabs,i) {
    const b = crabs[i];
    lib_base.jssert(!document.getElementById(b.id));
    publ_aqua_obj(b);
  });

  lib_base.array_loop(state.aquarium.objects.ytangs, function(ytangs,i) {
    const b = ytangs[i];
    lib_base.jssert(!document.getElementById(b.id));
    publ_aqua_obj(b);
  });

  lib_base.array_loop(state.aquarium.objects.btangs, function(btangs,i) {
    const b = btangs[i];
    lib_base.jssert(!document.getElementById(b.id));
    publ_aqua_obj(b);
  });

  lib_base.array_loop(state.aquarium.objects.anemonefish, function(anemonefish,i) {
    const b = anemonefish[i];
    lib_base.jssert(!document.getElementById(b.id));
    b.publ_aqua_obj_ane();
    publ_aqua_obj(b);
  });

  lib_base.array_loop(state.aquarium.objects.localfish, function(localfish,i) {
    const b = localfish[i];
    lib_base.jssert(!document.getElementById(b.id));
    publ_aqua_obj(b);
  });
}



