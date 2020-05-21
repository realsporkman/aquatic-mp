//   Project: https://github.com/realsporkman/aquatic-mp
//   File:    /js/build_ads_db.js
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


//////////////////////////////////////////////////////////
//
// lib_base
//
//////////////////////////////////////////////////////////


let lib_base = {};

let fs = require('fs');
let libpath = require('path');
let libchproc = require('child_process');
let libcrypto = require('crypto');

{

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


lib_base.string_is_alpha = function (s) {
  return (s.search(/^[a-zA-Z]*$/) != -1);
}



//
// ex:  let args = lib_base.get_args(process.argv);
//
//    return: {
//               n: num args ( = array.length)
//              'arg_token': array index
//               ...
//               array: args[1:]
//            }
//
lib_base.get_args = function (args) {
  let res = {};
  res.array = [];
  const sz = args.length;
  // args[0] is nodejs
  for (let i=1; i<sz; ++i) {
    res.array.push(args[i]);
    res[args[i]] = i;
  }
  res.n = res.array.length;
  return res;
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


lib_base.path_join = function (path, file) {
  return (path + '/' + file);
}


// '/ext/local/foo.txt'  ==> 'foo.txt'
// '/ext/local/foo.txt/' ==> 'foo.txt'
lib_base.path_basename = function (path) {
  return libpath.basename(path);
}


// '/ext/local/foo.txt'     ==> '.txt'
// '/ext/local/foo.bar.txt' ==> '.txt'
// '/ext/local/foo.'        ==> '.'
// '/ext/local/foo'         ==> ''
lib_base.path_extname = function (path) {
  return libpath.extname(path);
}


lib_base.get_dir_contents = function (path) {
  lib_base.jssert(lib_base.path_exists(path),'Path "' + path + '" doesn\'t exist');
  return fs.readdirSync(path);
}


//
// Travese directory contents at path
//
// class visitor
// {
//   constructor() {
//   }
//   visit(dir, file) {
//     // visit file
//   }
// }
//
lib_base.traverse_dir = function (path, visitor) {
  const files = lib_base.get_dir_contents(path);
  lib_base.array_loop(files, function (files,i) {
    visitor.visit(path,files[i]);
  });
}


//
// Recursively travese directory base + contents downward starting at path
//
// class visitor
// {
//   constructor() {
//   }
//   visit_dir(dir, depth) {
//     // visit directory
//     // return true to descend into
//   }
//   visit(dir, file, depth) {
//     // visit file
//   }
// }
//
//     ** fname=='' if at a directory base. Visitor must return true to descend
//        into the directory. Won't visit tree root dir (==path). depth==0 at
//        path, depth==1 at contents (including dirs), etc.
//
lib_base.traverse_dir_recurse = function (path, visitor) {

  function dir_recur(path, visitor, depth) {
    const files = lib_base.get_dir_contents(path);
    lib_base.array_loop(files, function (files,i) {
      const new_path = lib_base.path_join(path,files[i]);
      if (lib_base.path_is_directory(new_path)) {
        if (visitor.visit_dir(new_path, depth)) {
          dir_recur(new_path, visitor, depth+1);
        }
      } else {
        visitor.visit(path, files[i], depth);
      }
    });
  }

  dir_recur(path, visitor, 1);
}


// write string to path
lib_base.write_to_file = function (path, str) {
  fs.writeFileSync(path,str);
}


//
// Command execution utils
//


//
//  execsh : Execute a shell command
//
//  options:
//
//     cwd   : working directory of the command
//     input : stdin string for the command
//     env   : environment key-value pairs
//
//  Return object:
//
//     error   : if the return value != 0
//     cmd     : the command string
//     options : the options execsh was called with
//     retval  : the return value of the command process
//     stdout  : stdio output
//     stderr  : stderr output
//     signal  : signal used to kill the process, if any
//
lib_base.execsh = function (cmd, options) {
  let res = {};
  res.options = options;
  try {
    // Will throw if cmd errors
    const outp = libchproc.execSync(cmd, options);
    res.stdout = outp.toString();
    res.error = false;
    res.retval = 0;
    res.cmd = cmd;
  }
  catch(e) {
    res.error = true;
    res.retval = e.status;
    res.signal = e.signal;
    res.stdout = e.stdout ? e.stdout.toString() : '';
    res.stderr = e.stderr ? e.stderr.toString() : '';
    res.cmd = cmd;
  }
  return res;
}


//
// report_execsh_error : report a execsh return result to console
//
// ret: return object from execsh
//
lib_base.report_execsh_error = function (ret) {
  lib_base.console_log('[__errorsh error__]:');
  lib_base.console_log(ret.error);
  lib_base.console_log('[__cmd__]:');
  lib_base.console_log(ret.cmd);
  lib_base.console_log('[__options__]:');
  lib_base.console_log(ret.options);
  lib_base.console_log('[__stdout__]:');
  lib_base.console_log(ret.stdout);
  lib_base.console_log('[__stderr__]:');
  lib_base.console_log(ret.stderr);
  lib_base.console_log('[__retval__]:');
  lib_base.console_log(ret.retval);
  lib_base.console_log('___________________________');
}


//
// throw_execsh_error : report a execsh return result to console, then assert
//
// ret: return object from execsh
//
lib_base.assert_execsh_error = function (ret) {
  lib_base.report_execsh_error(ret);
  lib_base.jssert(0);
}


//
// libcrypto utils
//


//
// Generate hex string hash value from data
//
//   type : hash type - 'md5', 'sha256', 'sha512', etc
//
lib_base.gen_crypto_hash = function (data, type) {
  const hash = libcrypto.createHash(type);
  hash.update(data);
  return hash.digest('hex');
}

}


//////////////////////////////////////////////////////////
//
// lib_html
//
//////////////////////////////////////////////////////////

let lib_html = {};

{

//
// HTML Helpers
//

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

}


//////////////////////////////////////////////////////////
//
// lib_media
//
//////////////////////////////////////////////////////////


let lib_media = {};

{

//
// Media utils etc
//


lib_media.consts = {};

lib_media.consts.media_type = {};

lib_media.consts.media_type.unknown  = 0
lib_media.consts.media_type.song     = 1
lib_media.consts.media_type.video    = 2
lib_media.consts.media_type.image    = 3
lib_media.consts.media_type.album    = 4
lib_media.consts.media_type.misc     = 5


lib_media.get_file_type = function (ext) {
  switch (ext) {
    case '.mp3'  :
    case '.aiff' :
    case '.m4p'  : return lib_media.consts.media_type.song;
    case '.mp4'  :
    case '.mpg'  :
    case '.m4a'  :
    case '.m4v'  :
    case '.flv'  :
    case '.mov'  : return lib_media.consts.media_type.video;
    case '.jpg'  :
    case '.gif'  :
    case '.png'  : return lib_media.consts.media_type.image;
    case '.old'  :
    case '.db'   : return lib_media.consts.media_type.misc;
  };
  return lib_media.consts.media_type.unknown;
}


lib_media.escape_filename = function (filenm) {
  let result = '';
  for (let i=0; i<filenm.length; ++i) {
    const c = filenm[i];
    if (c=='"' || c=='`' || c=='$') {
      result += '\\';
    }
    result += c;
  }
  return result;
}


lib_media.escape_name_for_js = function (nm,pathnm,media_prfx) {
  if (nm.substring(0,pathnm.length)==pathnm) {
    nm = media_prfx + nm.substring(pathnm.length);
  }
  let result = '';
  for (let i=0; i<nm.length; ++i) {
    const c = nm[i];
    if (c=='\'') {
      result += '\\';
    }
    result += c;
  }
  return result;
}


lib_media.get_media_attrs = function (filenm,pathnm) {
  let attrs = {};
  const fn = lib_media.escape_filename(filenm);
  const cmd = 'ffprobe -v error -show_entries format -of default=noprint_wrappers=1 "' + fn + '"';
  const ret = lib_base.execsh(cmd);
  if (ret.error) {
    lib_base.assert_execsh_error(ret);
  } else {
    const outp = ret.stdout.trim();
    const out_lines = outp.split('\n');
    for (let i=0; i<out_lines.length; ++i) {
      const ln = out_lines[i];
      if (ln.length>2 && (ln.substr(ln.length-2)=='?>' || ln[0]=='<')) {
        continue;
      }
      const eq_idx = ln.indexOf('=');
      if (eq_idx<0) {
        continue;
      }
      const nm = ln.substr(0,eq_idx);
      let val = ln.substr(eq_idx+1);
      attrs[nm] = lib_html.escape_for_html(lib_media.escape_name_for_js(val,pathnm));
    };
  }
  return attrs;
}


lib_media.get_image_attrs = function (filenm) {
  let attrs = {};
  const fn = lib_media.escape_filename(filenm);
  const cmd = 'identify -format "%m %w %h\\n" "' + fn + '"';
  const ret = lib_base.execsh(cmd);
  if (ret.error) {
    lib_base.assert_execsh_error(ret);
  } else {
    const outp = ret.stdout.trim();
    const toks = outp.split(' ');
    const typ = toks[0];
    const w = toks[1];
    const h = toks[2];
    attrs['type'] = typ;
    attrs['w'] = w;
    attrs['h'] = h;
  }
  return attrs;
}


lib_media.dir_is_album = function (path) {
  const cmd = 'if (('
            + 'ls *.mp*'
            + ') || ('
            + 'ls *.m4*'
            + ') || ('
            + 'ls *.mov'
            + ') || ('
            + 'ls *.flv'
            + ') || ('
            + 'ls *.ai*'
            + ') || ('
            + 'ls folder.*'
            + ') || ('
            + 'ls cover.*'
            + ')) 1> /dev/null 2>&1; then echo "1\\c"; fi';

  const ret = lib_base.execsh(cmd,{ 'cwd' : path });

  if (ret.error) {
    lib_base.assert_execsh_error(ret);
  }

  return (ret.stdout=='1');
}


lib_media.title_sort_key = function (nm) {
  const s = nm.toLowerCase();
  if (s.substring(0,4)=='the ') {
    return s.substring(4);
  }
  return s;
}


lib_media.js_simple_pair_to_string = function (k, v) {
  let res = '\'' + k + '\' : ';
  if (v=='[]' || v=='{}') {
    res += v;
  } else {
    res += '\'' + v + '\'';
  }
  return res;
}


lib_media.js_map_to_string = function (obj) {
  let res = '';
  let first = true;
  for (const k in obj) {
    if (!first) {
      res += ', ';
    }
    first = false;
    res += lib_media.js_simple_pair_to_string(k,obj[k]);
  }
  return res;
}


lib_media.get_db_record_attrs = function (rec) {
  let year = '';
  let attrs = {};
  //lib_base.console_log('In:  ' + lib_media.js_map_to_string(rec));
  for (const key in rec) {
    const value  = rec[key];
    if (key=='attrs') {
      for (const k in value) {
        const v  = value[k];
        if (k=='format_name') {
          attrs['format'] = v;
        } else if (k=='size' || k=='type' || k=='w' || k=='h') {
          attrs[k] = v;
        } else if (k=='duration') {
          const sec_num = Math.floor(parseFloat(v));
          const hours = Math.floor(sec_num / 3600)
          const minutes = Math.floor((sec_num - (hours * 3600)) / 60)
          const seconds = sec_num - (hours * 3600) - (minutes * 60)
          if (seconds < 10) {
            attrs[k] = minutes.toString() + ':0' + seconds.toString();
          } else {
            attrs[k] = minutes.toString() + ':' + seconds.toString();
          }
        } else if (k=='TAG:title') {
          attrs['title'] = v;
        } else if (k=='TAG:artist') {
          attrs['artist'] = v;
        } else if (k=='TAG:album') {
          attrs['album'] = v;
        } else if (k=='TAG:track') {
          const toks = v.split('/');
          attrs['track'] = toks[0];
          if (toks.length>1) {
            attrs['track_total'] = toks[1];
          }
        } else if (k=='TAG:date' || year=='') {
          year = v.substring(0,4);
        } else if (k=='TAG:TYER') {
          year = v.substring(0,4);
        }
      }
    } else {
      attrs[key] = value;
    }
  }
  if (year!='' && year!='unde') {
    attrs['year'] = year;
  }
  attrs['id'] = lib_base.gen_crypto_hash(attrs['path'],'md5');
  //lib_base.console_log('Out: ' + lib_media.js_map_to_string(attrs));
  return attrs;
}

}


//////////////////////////////////////////////////////////
//
// build_ads_db
//
//////////////////////////////////////////////////////////


const args = lib_base.get_args(process.argv);

lib_base.jssert(args.n==2)

const root_dir       = args.array[1];
const path_ads       = root_dir + '/ads';
const path_db_ads_js = root_dir + '/www/js/db_ads.js';

{

class visitor
{
  constructor() {
    this.outp = '';
    this.data = [];
  }
  visit(base_dir, fname) {
    if (fname.charAt(0)=='.') {
      return;
    }
    let path = lib_base.path_join(base_dir, fname);
    if (!lib_base.path_is_directory(path)) {
      const typ = lib_media.get_file_type(lib_base.path_extname(fname));
      if (typ!=lib_media.consts.media_type.image) {
        return;
      }
      let rec = {};
      rec['path'] = lib_media.escape_name_for_js(path,path_ads,'/img/ads');
      rec['dir'] = lib_media.escape_name_for_js(base_dir,path_ads,'/img/ads');
      rec['ext'] = lib_base.path_extname(fname);
      rec['attrs'] = lib_media.get_image_attrs(path);
      rec['is_image'] = '1';
      this.data.push(rec);
    }
  }
}

let vstr = new visitor();

lib_base.traverse_dir(path_ads, vstr);

let res = '\'use strict\';\n\n';

let ads = [];

lib_base.array_loop(vstr.data, function (data,i) {
  const attrs = lib_media.get_db_record_attrs(data[i]);
  ads.push(attrs);
});

res += 'db[\'ads\'] = [];\n';

lib_base.array_loop(ads, function (ads,i) {
  const a = ads[i];
  res += 'db[\'ads\'].push(id_map[\'' + a['id'] + '\'] = new AdImg({';
  res += lib_media.js_map_to_string(a);
  res += '}));\n';
});

res += '\n';

lib_base.write_to_file(path_db_ads_js,res);

}


//////////////////////////////////////////////////////////
//
// build_media_db
//
//////////////////////////////////////////////////////////


const path_content = root_dir + '/media';
const path_db_js   = root_dir + '/www/js/db.js';

class visitor
{
  constructor() {
    this.outp = '';
    this.data = [];
  }

  visit_dir(dir, depth) {
    if (dir.charAt(0)=='.') {
      return false;
    }
    if (lib_media.dir_is_album(dir)) {
      let rec = {};
      rec['is_album'] = '1';
      rec['album_dir'] = lib_media.escape_name_for_js(dir,path_content,'/media');
      rec['path'] = rec['album_dir'];
      this.data.push(rec);
    }
    return true;
  }

  visit(dir, file, depth) {
    if (file.charAt(0)=='.') {
      return;
    }
    const path = lib_base.path_join(dir, file);
    const ext = lib_base.path_extname(path);
    const typ = lib_media.get_file_type(ext);
    let rec = {};
    rec['path'] = lib_media.escape_name_for_js(path,path_content,'/media');
    rec['album_dir'] = lib_media.escape_name_for_js(dir,path_content,'/media');
    rec['ext'] = ext;
    switch (typ) {
      case lib_media.consts.media_type.image: {
        rec['attrs'] = lib_media.get_image_attrs(path);
        rec['is_image'] = '1';
        if (file.substring(0,5).toLowerCase()=='cover' ||
            file.substring(0,6).toLowerCase()=='folder') {
          rec['is_cover'] = '1';
        }
      } break;
      case lib_media.consts.media_type.song: {
        rec['attrs'] = lib_media.get_media_attrs(path,path_content);
        rec['is_song'] = '1';
      } break;
      case lib_media.consts.media_type.video: {
        rec['attrs'] = lib_media.get_media_attrs(path,path_content);
        rec['is_video'] = '1';
      } break;
      default : {
      };
    };
    this.data.push(rec);
  }
}

let vstr = new visitor();

lib_base.traverse_dir_recurse(path_content, vstr);

function write_album(owner, adir, a) {
  let res = owner + '[\'' + adir + '\'] = id_map[\'' + a['id'] + '\'] = new Album({';
  let amap = {};
  for (let key in a) {
    const val = a[key];
    if (key=='music' || key=='covers') {
      amap[key] = '[]';
    } else {
      amap[key] = val;
    }
  }
  res += lib_media.js_map_to_string(amap);
  res += '});\n';
  lib_base.array_loop(a['music'],function (v,i) {
    const val = v[i];
    res += owner + '[\'' + adir + '\'].music.push(id_map[\'' + val['id'] + '\'] = new ';
    if ('is_song' in val) {
      res += 'Song({';
    } else {
      lib_base.jssert('is_video' in val);
      res += 'Video({';
    }
    res += lib_media.js_map_to_string(val);
    res += '}));\n';
  });
  lib_base.array_loop(a['covers'],function (v,i) {
    const val = v[i];
    res += owner + '[\'' + adir + '\'].covers.push(id_map[\'' + val['id'] + '\'] = new CoverImg({';
    res += lib_media.js_map_to_string(val);
    res += '}));\n';
  });
  return res;
}


function write_index_letter(owner, r, albums) {
  let res = owner + '.push([\'' + r[0] + '\', []]);\n';
  let amap = {};
  lib_base.array_loop(r[1],function (v,i) {
    const a = v[i];
    res += owner + '[' + owner + '.length-1][1].push(new IndexLink(\'';
    res += a[0] + '\', \'' + a[1] + '\', \'' + albums[a[0]]['id'] + '_idx_link\'));\n';
  });
  return res;
}


let res = '\'use strict\';\n\n';

let media = [];
let albums = [];
let img_lib = {};

lib_base.array_loop(vstr.data,function (v,i) {
  const rec = v[i];
  let typ;
  if ('is_album' in rec) {
    typ = lib_media.consts.media_type.album;
  } else {
    typ = lib_media.get_file_type(rec['ext']);
  }
  let attrs = lib_media.get_db_record_attrs(rec);
  if (typ==lib_media.consts.media_type.song ||
      typ==lib_media.consts.media_type.video ||
      typ==lib_media.consts.media_type.image) {
    if (typ!=lib_media.consts.media_type.image &&
        !('title' in attrs)) {
      let fn = lib_base.path_basename(attrs['path']);
      fn = fn.substring(0,fn.length-attrs['ext'].length);
      attrs['title'] = lib_html.escape_for_html(fn)
    }
    let id_nm = attrs['path'];
    id_nm = id_nm.substring(0,id_nm.length-attrs['ext'].length);
    attrs['id_nm'] = lib_base.gen_crypto_hash(lib_html.escape_for_html(id_nm),'md5');
    if (typ==lib_media.consts.media_type.image) {
      img_lib[attrs['id_nm']] = attrs['id'];
    }
    media.push(attrs);

  } else if (typ==lib_media.consts.media_type.album) {
     rec['id'] = lib_base.gen_crypto_hash(attrs['path'],'md5');
     albums.push(rec);
  } else if (typ==lib_media.consts.media_type.misc) {
    // Pass
  } else {
    lib_base.console_log('Warning: Unsupported file type: ' + lib_base.obj_to_string(rec));
  }
});


/*

'media' example records:

-- 'path' : '/media/Trainspotting/08. Lou Reed - Perfect Day.mp3', 'album_dir' : '/media/Trainspotting', 'ext' : '.mp3', 'format' : 'mp3', 'duration' : '3:44', 'size' : '6145220', 'title' : 'Perfect Day', 'artist' : 'Lou Reed', 'album' : 'Trainspotting', 'track' : '8', 'track_total' : '14', 'is_song' : '1', 'year' : '1996', 'id' : 'c6ced020baf1dbd48c5dd84b5ea769eb', 'id_nm' : '239d2b5e2bd5cb337f2f9e90f5a4ffa9'
-- 'path' : '/media/Videos 03/Diplo - Revolution (feat. Faustix & Imanos and Kai).mp4', 'album_dir' : '/media/Videos 03', 'ext' : '.mp4', 'format' : 'mov,mp4,m4a,3gp,3g2,mj2', 'duration' : '4:15', 'size' : '45278286', 'is_video' : '1', 'id' : 'f83d9c40be7b1dcfc83a999b3fb36901', 'title' : 'Diplo - Revolution (feat. Faustix &amp; Imanos and Kai)', 'id_nm' : '9de1ae1e421a6c14efdc7f68745d7a75'

*/


let db = {};
let album_names = [];

lib_base.array_loop(albums,function (v,i) {
  const a = v[i];
  const adir = a['album_dir'];
  a['music'] = [];
  a['covers'] = [];
  a['title'] = lib_html.escape_for_html(lib_base.path_basename(adir));
  db[adir] = a;
  album_names.push([lib_media.title_sort_key(a['title']),adir,a['title']]);
});

let num_songs = 0;

lib_base.array_loop(media,function (v,i) {
  const m = v[i];
  const adir = m['album_dir'];
  lib_base.jssert(adir in db);
  const d = db[adir];
  if (('is_song' in m) || ('is_video' in m)) {
    d['music'].push(m);
    num_songs += 1;
  } else if ('is_cover' in m) {
    d['covers'].push(m);
  }
});

lib_base.array_loop(media,function (v,i) {
  const m = v[i];
  const adir = m['album_dir'];
  lib_base.jssert(adir in db);
  const d = db[adir];
  if (('is_image' in m) && !('is_cover' in m)) {
    d['covers'].push(m);
  }
});

let albums_with_covers = [];

lib_base.array_loop(albums,function (v,i) {
  const a = v[i];
  if (a['covers'].length>0) {
    albums_with_covers.push(a['id']);
  }
});

res += 'let id_map = {};';
res += 'let db = new MediaDB({';
res += lib_media.js_simple_pair_to_string('num_albums',album_names.length.toString());
res += ', ';
res += lib_media.js_simple_pair_to_string('num_songs',num_songs.toString());
res += ', albums : {}, index : [], albums_w_covers : [], img_lib : {} });\n';

for (let adir in db) {
  const a = db[adir];
  lib_base.jssert('is_album' in a);
  res += write_album('db.albums',adir,a);
}

album_names.sort(function (la,ra) {
  return la[0].localeCompare(ra[0]);
});

let letter = '';
let als = [];
let als_num = [];
let ares = [];
let flag = false;

lib_base.array_loop(album_names,function (v,i) {
  const a = v[i];
  const l = a[0][0];
  if (lib_base.string_is_alpha(l)) {
    if (l!=letter && flag) {
      const c_als = als.slice();
      ares.push([letter.toUpperCase(), c_als]);
      als = [[a[1],a[2]]];
    } else {
      als.push([a[1],a[2]]);
    }
    letter = l;
    flag = true;
  } else {
    als_num.push([a[1],a[2]]);
  }
});

if (als.length>0) {
  ares.push([letter.toUpperCase(),als]);
}

if (als_num.length>0) {
  ares.push(['#',als_num]);
}

lib_base.array_loop(ares,function (v,i) {
  const r = v[i];
  res += write_index_letter('db.index',r,db);
});

lib_base.array_loop(albums_with_covers,function (v,i) {
  const a = v[i];
  res += 'db.albums_w_covers.push(\'' + a + '\');\n';
});

// print map of id_nm to id of image w same id_nm
res += 'db.img_lib = ' + lib_base.obj_to_string(img_lib) + '\n';

res += '\n';

lib_base.write_to_file(path_db_js,res);
