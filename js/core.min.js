var base, base1, base2, base3, base4,
  slice = [].slice;

if ((base = String.prototype).startsWith == null) {
  base.startsWith = function(s) {
    return this.slice(0, s.length) === s;
  };
}

if ((base1 = String.prototype).endsWith == null) {
  base1.endsWith = function(s) {
    return s === '' || this.slice(-s.length) === s;
  };
}

if ((base2 = String.prototype).join == null) {
  base2.join = function() {
    var parts, sep;
    sep = arguments[0], parts = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    _.filter(parts, function(part) {
      return part != null;
    });
    return parts.join(sep);
  };
}

if ((base3 = Array.prototype).combine == null) {
  base3.combine = function(sep) {
    var part, regex, replaced;
    regex = new RegExp(sep + '$|^' + sep);
    replaced = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = this.length; i < len; i++) {
        part = this[i];
        results.push(part.replace(regex, ''));
      }
      return results;
    }).call(this);
    return replaced.join(sep);
  };
}

Array.prototype.partition = function(callback) {
  var i, index, item, len, negative, positive, ref;
  ref = [[], []], positive = ref[0], negative = ref[1];
  for (index = i = 0, len = this.length; i < len; index = ++i) {
    item = this[index];
    (callback(item, index) ? positive : negative).push(item);
  }
  return [positive, negative];
};

Array.prototype.groupped = function(groupSize, groupCallback) {
  var group, i, key, len;
  group = [];
  for (i = 0, len = this.length; i < len; i++) {
    key = this[i];
    group.push(key);
    if (group.length >= groupSize) {
      groupCallback(group);
      group = [];
    }
  }
  if (group.length > 0) {
    return groupCallback(group);
  }
};

Array.prototype.takeWhile = function(callback) {
  var acc, i, item, len;
  acc = [];
  for (i = 0, len = this.length; i < len; i++) {
    item = this[i];
    if (!callback(item)) {
      return acc;
    }
    acc.push(item);
  }
};

if ((base4 = String.prototype).formatDate == null) {
  base4.formatDate = function() {
    var date;
    date = new Date(this);
    return date.toLocaleString();
  };
}

Array.prototype.nearest = function(value, size) {
  var i, index, item, left, len;
  index = 0;
  for (index = i = 0, len = this.length; i < len; index = ++i) {
    item = this[index];
    if (value === item) {
      break;
    }
  }
  left = Math.max(0, index - Math.floor(size / 2));
  return this.slice(left, +(left + size - 1) + 1 || 9e9);
};

/* MultiFile - A JavaScript library to load multiple files from
   tar archives and json_packed files (see http://gist.github.com/407595)

  Example: Loading multiple images from a tarball.

  MultiFile.load('images.tar', function(xhr) {
    this.files.forEach(function(f) {
      var e = document.createElement('div');
      document.body.appendChild(e);
      var p = document.createElement('p');
      p.appendChild(document.createTextNode(f.filename + " (" + f.length + " bytes)"));
      e.appendChild(p);
      var img = new Image();
      img.src = f.toDataURL();
      e.appendChild(img);
    });
  });

  Example 2: Streaming images from a tarball.

  MultiFile.stream('images.tar', function(f) {
      var e = document.createElement('div');
      document.body.appendChild(e);
      var p = document.createElement('p');
      p.appendChild(document.createTextNode(f.filename + " (" + f.length + " bytes)"));
      e.appendChild(p);
      var img = new Image();
      img.src = f.toDataURL();
      e.appendChild(img);
  });


Copyright (c) 2010 Ilmari Heikkinen

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

MultiFile = function(){};

// Load and parse archive, calls onload after loading all files.
MultiFile.load = function(url, onload) {
  var o = new MultiFile();
  o.onload = onload;
  o.load(url);
  return o;
}

// Streams an archive from the given url, calling onstream after loading each file in archive.
// Calls onload after loading all files.
MultiFile.stream = function(url, onstream, onload) {
  var o = new MultiFile();
  o.onload = onload;
  o.onstream = onstream;
  o.load(url);
  return o;
}
MultiFile.prototype = {
  onerror : null,
  onload : null,
  onstream : null,

  base64Encode : function(str) {
    var CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var out = "", i = 0, len = str.length, c1, c2, c3;
    while (i < len) {
        c1 = str.charCodeAt(i++) & 0xff;
        if (i == len) {
            out += CHARS.charAt(c1 >> 2);
            out += CHARS.charAt((c1 & 0x3) << 4);
            out += "==";
            break;
        }
        c2 = str.charCodeAt(i++);
        if (i == len) {
            out += CHARS.charAt(c1 >> 2);
            out += CHARS.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
            out += CHARS.charAt((c2 & 0xF) << 2);
            out += "=";
            break;
        }
        c3 = str.charCodeAt(i++);
        out += CHARS.charAt(c1 >> 2);
        out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
        out += CHARS.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
        out += CHARS.charAt(c3 & 0x3F);
    }
    return out;
  },

  load : function(url) {
    var xhr = new XMLHttpRequest();
    var self = this;
    var offset = 0;
    this.files = [];
    var isTar = (/\.tar(\?.*)?$/i).test(url);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200 || xhr.status == 0) {
          if (isTar)
            offset = self.processTarChunks(xhr.responseText, offset);
          else
            self.processJSONChunks(xhr.responseText);
          if (self.onload)
            self.onload(xhr);
        } else {
          if (self.onerror)
            self.onerror(xhr);
        }
      } else if (xhr.readyState == 3) {
        if (xhr.status == 200 || xhr.status == 0) {
          if (isTar)
            offset = self.processTarChunks(xhr.responseText, offset);
          else
            self.processJSONChunks(xhr.responseText);
        }
      }
    };
    xhr.open("GET", url, true);
    xhr.overrideMimeType("text/plain; charset=x-user-defined");
    xhr.setRequestHeader("Content-Type", "application/octet-stream");
    xhr.send(null);
  },

  onerror : function(xhr) {
    alert("Error: "+xhr.status);
  },

  parseJSON : function(text) {
    this.processJSONChunks(text);
  },
  processJSONChunks : function(text) {
    if (this.files.length == 0) { // processing headers
      var idx = text.indexOf('\n');
      if (idx >= 0) { // got header
        this.files = JSON.parse(text.substring(0,idx));
        this.files.forEach(function(f) { f.offset += idx + 1; })
      }
    }
    if (this.files.length > 0) { // processing data
      var f = null;
      var idx=0;
      for (idx=0; idx<this.files.length; idx++) {
        if (this.files[idx].data == null) {
          f = this.files[idx];
          break;
        }
      }
      while (f && f.data == null && f.offset + f.length <= text.length) {
        f.data = text.substring(f.offset, f.offset + f.length);
        f.toDataURL = this.__toDataURL;
        if (this.onstream) this.onstream(f);
        f = this.files[idx++];
      }
    }
  },

  cleanHighByte : function(s) {
    return s.replace(/./g, function(m) {
      return String.fromCharCode(m.charCodeAt(0) & 0xff);
    });
  },

  parseTar : function(text) {
    this.files = [];
    this.processTarChunks(text, 0);
  },
  processTarChunks : function (responseText, offset) {
    var self = this;
    makeUint8Array = function(str) {
      try {
        var arr = new Uint8Array(str.length);
        for (var i = 0, len = str.length; i < len; ++i) arr[i] = str.charCodeAt(i);
        return arr;
      } catch(e) {
        return { base64Encoded: self.base64Encode(str) };
      }
    }


    while (responseText.length >= offset + 512) {
      var header = this.files.length == 0 ? null : this.files[this.files.length-1];
      if (header && header.data == null) {
        if (offset + header.length <= responseText.length) {
          header.data = makeUint8Array(responseText.substring(offset, offset+header.length));

          header.toDataURL = this.__toDataURL;
          offset += 512 * Math.ceil(header.length / 512);
          if (this.onstream)
            this.onstream(header);
        } else { // not loaded yet
          break;
        }
      } else {
        var header = this.parseTarHeader(responseText, offset);
        if (header.length > 0 || header.filename != '') {
          this.files.push(header);
          offset += 512;
          header.offset = offset;
        } else { // empty header, stop processing
          offset = responseText.length;
        }
      }
    }
    return offset;
  },
  parseTarHeader : function(text, offset) {
    var i = offset || 0;
    var h = {};
    h.filename = text.substring(i, i+=100).split("\0", 1)[0];
    h.mode = text.substring(i, i+=8).split("\0", 1)[0];
    h.uid = text.substring(i, i+=8).split("\0", 1)[0];
    h.gid = text.substring(i, i+=8).split("\0", 1)[0];
    h.length = this.parseTarNumber(text.substring(i, i+=12));
    h.lastModified = text.substring(i, i+=12).split("\0", 1)[0];
    h.checkSum = text.substring(i, i+=8).split("\0", 1)[0];
    h.fileType = text.substring(i, i+=1).split("\0", 1)[0];
    h.linkName = text.substring(i, i+=100).split("\0", 1)[0];
    return h;
  },
  parseTarNumber : function(text) {
    // if (text.charCodeAt(0) & 0x80 == 1) {
    // GNU tar 8-byte binary big-endian number
    // } else {
      // return parseInt('0'+text.replace(/[^\d]/g, ''));
      return parseInt(text.replace(/^0*/, ''), 8) || 0;
    // }
  },

  __toDataURL : function() {
    if (this.data.substring(0,40).match(/^data:[^\/]+\/[^,]+,/)) {
      return this.data;
    } else if (MultiFile.prototype.cleanHighByte(this.data.substring(0,10)).match(/\377\330\377\340..JFIF/)) {
      return 'data:image/jpeg;base64,'+btoa(MultiFile.prototype.cleanHighByte(this.data));
    } else if (MultiFile.prototype.cleanHighByte(this.data.substring(0,6)) == "\211PNG\r\n") {
      return 'data:image/png;base64,'+btoa(MultiFile.prototype.cleanHighByte(this.data));
    } else if (MultiFile.prototype.cleanHighByte(this.data.substring(0,6)).match(/GIF8[79]a/)) {
      return 'data:image/gif;base64,'+btoa(MultiFile.prototype.cleanHighByte(this.data));
    } else {
      throw("toDataURL: I don't know how to handle " + this.filename);
    }
  }
}


var namespace;

namespace = function(path) {
  var i, len, part, ref, results, root;
  root = this;
  ref = path.split('.');
  results = [];
  for (i = 0, len = ref.length; i < len; i++) {
    part = ref[i];
    root[part] || (root[part] = {});
    results.push(root = root[part]);
  }
  return results;
};

namespace('sys.xhr');

sys.xhr.makeXhr = function() {
  var error, xhr;
  try {
    if (window.ActiveXObject) {
      xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
  } catch (error) {

  }
  if (!xhr) {
    return xhr = new XMLHttpRequest();
  }
};

sys.xhr.getJson = function(url, success) {
  var xhr;
  xhr = sys.xhr.makeXhr();
  xhr.onreadystatechange = function() {
    var e, error;
    if (xhr.readyState === 4) {
      if (xhr.status === 200 || xhr.status === 0) {
        try {
          success(xhr.responseText);
        } catch (error) {
          e = error;
          success('{}');
        }
        return;
      }
      return success('{}');
    }
  };
  xhr.open('GET', url, true);
  xhr.setRequestHeader('Content-type', 'application/json');
  return xhr.send();
};

namespace('sys.modules');

sys.mainModuleName = 'check-please';

sys.modules.registred = [];

sys.modules.critical = ['ngResource', 'ionic', 'sys.menu'];

sys.modules.unique = function() {
  var i, j, len, len1, module, name, ref, ref1, results, unique, value;
  unique = {};
  ref = sys.modules.registred;
  for (i = 0, len = ref.length; i < len; i++) {
    module = ref[i];
    unique[module.name] = 1;
  }
  ref1 = sys.modules.critical;
  for (j = 0, len1 = ref1.length; j < len1; j++) {
    module = ref1[j];
    unique[module] = 1;
  }
  results = [];
  for (name in unique) {
    value = unique[name];
    results.push(name);
  }
  return results;
};

sys.modules.originalModuleFn = angular.module;

sys.modules.loadJsesInDataDir = function(subdir, loadJsesCallback) {
  var onEntriesError, onEntriesSuccess;
  onEntriesSuccess = function(entries) {
    var dir, entry;
    dir = subdir || 'data directory';
    console.log("Loading jses in " + dir, entries);
    return loadJsesCallback((function() {
      var i, len, results;
      results = [];
      for (i = 0, len = entries.length; i < len; i++) {
        entry = entries[i];
        results.push(entry.toURL());
      }
      return results;
    })());
  };
  onEntriesError = function(error) {
    if (console.log) {
      console.log(error);
    }
    return loadJsesCallback([]);
  };
  return sys.c0d3r.Filesystem.getEntitiesByExtension('js', {
    path: subdir,
    success: function(entries) {
      var entry, i, len;
      for (i = 0, len = entries.length; i < len; i++) {
        entry = entries[i];
        entry.toURL = function() {
          return entry.fullPath;
        };
      }
      return onEntriesSuccess(entries);
    },
    error: onEntriesError
  });
};

angular.module = function(module, requires, configFn) {
  var moduleName, moduleVersion;
  if (angular.isArray(module)) {
    moduleName = module[0];
    moduleVersion = module[1];
    if (moduleName !== sys.mainModuleName) {
      sys.modules.registred.push({
        name: moduleName,
        version: moduleVersion
      });
    }
  } else {
    moduleName = module;
    moduleVersion = '---';
  }
  return sys.modules.originalModuleFn.call(this, moduleName, requires, configFn);
};

namespace('sys.scrolling.infinite');

sys.scrolling.infinite.Class = (function() {
  function Class(httpService, items, url, params) {
    this.httpService = httpService;
    this.items = items;
    this.url = url;
    this.params = params;
    this.loading = false;
  }

  Class.prototype.append = function() {
    this.loading = true;
    return this.httpService.get(this.url, this.params).then((function(_this) {
      return function(data) {
        var ref, ref1, ref2, results;
        results = (data != null ? (ref = data.data) != null ? ref.results : void 0 : void 0) || [];
        (ref1 = _this.items).push.apply(ref1, results);
        return _this.url = data != null ? (ref2 = data.data) != null ? ref2.next : void 0 : void 0;
      };
    })(this))["finally"]((function(_this) {
      return function() {
        return _this.loading = false;
      };
    })(this));
  };

  Class.prototype.hasNext = function() {
    return !!this.url;
  };

  Class.prototype.all = function() {
    if (!this.hasNext()) {
      return {
        results: this.items
      };
    }
    return this.append().then((function(_this) {
      return function() {
        return _this.all();
      };
    })(this));
  };

  return Class;

})();

namespace('sys.auth.basic');

sys.auth.basic.Service = (function() {
  Service.$inject = ['$resource', '$http'];

  function Service(resource, http) {
    this.resource = resource;
    this.http = http;
  }

  Service.prototype.get = function(url, params) {
    var ff, passwd, ref, res, user;
    ref = params != null ? params.credentials : void 0, user = ref.user, passwd = ref.passwd;
    ff = {
      get: {
        method: 'GET',
        headers: {
          Authorization: 'Basic ' + btoa(user + ':' + passwd)
        }
      }
    };
    res = this.resource(url, {}, ff);
    this.restaurants = [];
    return res.get(params != null ? params.params : void 0).$promise;
  };

  Service.prototype.post = function(url, params) {
    var ff, passwd, ref, res, user;
    ref = params != null ? params.credentials : void 0, user = ref.user, passwd = ref.passwd;
    ff = {
      save: {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + btoa(user + ':' + passwd),
          'Content-Type': 'application/json'
        }
      }
    };
    res = this.resource(url, {}, ff);
    this.restaurants = [];
    return res.save(params != null ? params.params : void 0, params != null ? params.data : void 0).$promise;
  };

  Service.prototype.put = function(url, params) {
    var ff, passwd, ref, res, user;
    ref = params != null ? params.credentials : void 0, user = ref.user, passwd = ref.passwd;
    ff = {
      save: {
        method: 'PUT',
        headers: {
          Authorization: 'Basic ' + btoa(user + ':' + passwd),
          'Content-Type': 'application/json'
        }
      }
    };
    res = this.resource(url, {}, ff);
    this.restaurants = [];
    return res.save(params != null ? params.params : void 0, params != null ? params.data : void 0).$promise;
  };

  return Service;

})();



var slice = [].slice;

namespace('sys.c0d3r');

sys.c0d3r.Filesystem = (function() {
  function Filesystem() {}

  Filesystem.path_separator = '/';

  Filesystem.emptyFn = function() {};

  Filesystem.apiSupported = function() {
    var ref;
    return (((typeof cordova !== "undefined" && cordova !== null ? (ref = cordova.file) != null ? ref.dataDirectory : void 0 : void 0) != null) || (window.requestFileSystem != null) || (window.webkitRequestFileSystem != null)) && (window.resolveLocalFileSystemURL != null);
  };

  Filesystem.getEntitiesByExtension = function(extension, options) {
    var asyncTasks, collectFilesInDir, entries, error, path, recursively, regexp, success;
    path = options.path, success = options.success, error = options.error, recursively = options.recursively;
    if (success == null) {
      success = sys.c0d3r.Filesystem.emptyFn;
    }
    if (error == null) {
      error = sys.c0d3r.Filesystem.emptyFn;
    }
    if (recursively == null) {
      recursively = true;
    }
    if (path == null) {
      path = '';
    }
    entries = [];
    asyncTasks = 0;
    regexp = RegExp(".*\\." + extension + "$");
    collectFilesInDir = function(dir) {
      var dirReader, readEntries;
      asyncTasks++;
      dirReader = dir.createReader();
      readEntries = function() {
        return dirReader.readEntries(function(results) {
          var addToEntries, entry, i, len;
          if (!results.length) {
            asyncTasks--;
            if (asyncTasks <= 0) {
              return success(entries.sort());
            }
          } else {
            addToEntries = function(entry) {
              if (entry.isDirectory && recursively) {
                return collectFilesInDir(entry);
              } else {
                if (regexp.test(entry.name)) {
                  return entries.push(entry);
                }
              }
            };
            for (i = 0, len = results.length; i < len; i++) {
              entry = results[i];
              addToEntries(entry);
            }
            return readEntries();
          }
        });
      };
      return readEntries();
    };
    return sys.c0d3r.Filesystem.getDirectoryInDataDir(path, {
      success: collectFilesInDir,
      error: error
    });
  };

  Filesystem.getDirectoryInDataDir = function(path, options) {
    var dirSucces, dirs, error, success;
    success = options.success, error = options.error;
    if (success == null) {
      success = sys.c0d3r.Filesystem.emptyFn;
    }
    if (error == null) {
      error = sys.c0d3r.Filesystem.emptyFn;
    }
    dirs = sys.c0d3r.Filesystem.splitPath(path);
    dirSucces = function(dir) {
      var nextDir, ref;
      ref = dirs, nextDir = ref[0], dirs = 2 <= ref.length ? slice.call(ref, 1) : [];
      if (!!nextDir) {
        dir.getDirectory(nextDir, {
          create: true
        }, dirSucces, error);
        return;
      }
      return success(dir);
    };
    return sys.c0d3r.Filesystem.getDataDir(dirSucces, error);
  };

  Filesystem.getFileInDataDir = function(path, options) {
    var dirs, error, file, i, onSuccess, ref, success;
    ref = sys.c0d3r.Filesystem.splitPath(path), dirs = 2 <= ref.length ? slice.call(ref, 0, i = ref.length - 1) : (i = 0, []), file = ref[i++];
    success = options.success, error = options.error;
    if (success == null) {
      success = sys.c0d3r.Filesystem.emptyFn;
    }
    if (error == null) {
      error = sys.c0d3r.Filesystem.emptyFn;
    }
    onSuccess = function(dir) {
      return dir.getFile(file, {
        create: false
      }, success, error);
    };
    return sys.c0d3r.Filesystem.getDirectoryInDataDir(dirs.join(sys.c0d3r.Filesystem.path_separator), {
      success: onSuccess,
      error: error
    });
  };

  Filesystem.createBlob = function(array, blobType) {
    var BlobBuilder, blob, builder, error1;
    if (array.base64Encoded != null) {
      return array;
    }
    try {
      blob = new Blob([array], {
        type: blobType
      });
    } catch (error1) {
      BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
      if (BlobBuilder) {
        builder = new BlobBuilder();
        builder.append(array);
        blob = builder.getBlob();
      } else {
        blob = array;
      }
    }
    return blob;
  };

  Filesystem.saveAs = function(filename, data, options) {
    var blobType, dirs, error, file, i, ref, saveToDir, success;
    blobType = options.blobType, success = options.success, error = options.error;
    if (blobType == null) {
      blobType = 'text/plain';
    }
    if (success == null) {
      success = sys.c0d3r.Filesystem.emptyFn;
    }
    if (error == null) {
      error = sys.c0d3r.Filesystem.emptyFn;
    }
    ref = sys.c0d3r.Filesystem.splitPath(filename), dirs = 2 <= ref.length ? slice.call(ref, 0, i = ref.length - 1) : (i = 0, []), file = ref[i++];
    saveToDir = function(dir) {
      var saveData;
      saveData = function(fileEntity) {
        var write;
        write = function(writer) {
          writer.onwriteend = success;
          writer.onwriteend = function() {
            writer.onwriteend = success;
            return writer.write(sys.c0d3r.Filesystem.createBlob(data, blobType));
          };
          writer.onerror = error;
          return writer.truncate(0);
        };
        return fileEntity.createWriter(write, error);
      };
      return dir.getFile(file, {
        create: true
      }, saveData, error);
    };
    return sys.c0d3r.Filesystem.getDirectoryInDataDir(dirs.join(sys.c0d3r.Filesystem.path_separator), {
      success: saveToDir,
      error: error
    });
  };

  Filesystem.saveAsText = function(filename, data, options) {
    return sys.c0d3r.Filesystem.saveAs(filename, data, {
      blobType: 'text/plain',
      success: options != null ? options.success : void 0,
      error: options != null ? options.error : void 0
    });
  };

  Filesystem.saveAsBinary = function(filename, data, options) {
    return sys.c0d3r.Filesystem.saveAs(filename, data.buffer || data, {
      blobType: 'application/octet-stream',
      success: options != null ? options.success : void 0,
      error: options != null ? options.error : void 0
    });
  };

  Filesystem.readAsDataUrlFn = function(reader, fileObject) {
    return reader.readAsDataURL(fileObject);
  };

  Filesystem.readAsTextFn = function(reader, fileObject) {
    return reader.readAsText(fileObject);
  };

  Filesystem.readAs = function(filename, readFn, options) {
    var dirs, error, file, i, readFileInDir, ref, success;
    success = options.success, error = options.error;
    if (success == null) {
      success = sys.c0d3r.Filesystem.emptyFn;
    }
    if (error == null) {
      error = sys.c0d3r.Filesystem.emptyFn;
    }
    ref = sys.c0d3r.Filesystem.splitPath(filename), dirs = 2 <= ref.length ? slice.call(ref, 0, i = ref.length - 1) : (i = 0, []), file = ref[i++];
    readFileInDir = function(dir) {
      var onFileEntrySuccess;
      onFileEntrySuccess = function(fileEntity) {
        var onFileSuccess;
        onFileSuccess = function(fileObj) {
          var reader;
          reader = new FileReader;
          reader.onloadend = function(e) {
            return success(this.result);
          };
          reader.onerror = error;
          return readFn(reader, fileObj);
        };
        return fileEntity.file(onFileSuccess, error);
      };
      return dir.getFile(file, {
        create: false
      }, onFileEntrySuccess, error);
    };
    return sys.c0d3r.Filesystem.getDirectoryInDataDir(dirs.join(sys.c0d3r.Filesystem.path_separator), {
      success: readFileInDir,
      error: error
    });
  };

  Filesystem.readAsText = function(filename, options) {
    return sys.c0d3r.Filesystem.readAs(filename, sys.c0d3r.Filesystem.readAsTextFn, {
      success: options != null ? options.success : void 0,
      error: options != null ? options.error : void 0
    });
  };

  Filesystem.readAsDataUrl = function(filename, options) {
    return sys.c0d3r.Filesystem.readAs(filename, sys.c0d3r.Filesystem.readAsDataUrlFn, {
      success: options != null ? options.success : void 0,
      error: options != null ? options.error : void 0
    });
  };

  Filesystem.getDataDir = function(success, error) {
    var onInitFs, ref;
    if (success == null) {
      success = sys.c0d3r.Filesystem.emptyFn;
    }
    if (error == null) {
      error = sys.c0d3r.Filesystem.emptyFn;
    }
    if ((typeof cordova !== "undefined" && cordova !== null ? (ref = cordova.file) != null ? ref.dataDirectory : void 0 : void 0) != null) {
      return window.resolveLocalFileSystemURL(cordova.file.dataDirectory, success, error);
    }
    onInitFs = function(fs) {
      return success(fs.root);
    };
    if (window.requestFileSystem == null) {
      window.requestFileSystem = window.webkitRequestFileSystem;
    }
    return window.requestFileSystem(window.TEMPORARY, 1024 * 1024, onInitFs, error);
  };

  Filesystem.splitPath = function(filename) {
    return filename.split(sys.c0d3r.Filesystem.path_separator);
  };

  Filesystem.addPathComponent = function(path, component) {
    if (!path.endsWith(sys.c0d3r.Filesystem.path_separator)) {
      path += sys.c0d3r.Filesystem.path_separator;
    }
    if (component.startsWith(sys.c0d3r.Filesystem.path_separator)) {
      component = component.slice(1);
    }
    return path += component;
  };

  Filesystem.resourceUrl = function(path) {
    var ref;
    if ((typeof cordova !== "undefined" && cordova !== null ? (ref = cordova.file) != null ? ref.applicationDirectory : void 0 : void 0) != null) {
      return [cordova.file.applicationDirectory, 'www/resources', path].join('/');
    } else {
      return ['resources', path].join('/');
    }
  };

  return Filesystem;

})();

namespace('sys.menu');

sys.menu.Controller = (function() {
  Controller.$inject = ['$scope', 'sys.menu.state', '$window', '$state', 'ru.diag.pro.error.codes.device.isCriticalError', 'ru.diag.pro.error.codes.device.isWarningError'];

  function Controller(scope, menuState, window, state1, isCriticalError, isWarningError) {
    this.scope = scope;
    this.menuState = menuState;
    this.window = window;
    this.state = state1;
    this.isCriticalError = isCriticalError;
    this.isWarningError = isWarningError;
    this.scope.$watch(((function(_this) {
      return function() {
        return _this.window.matchMedia(sys.menu.mediaQuery).matches;
      };
    })(this)), (function(_this) {
      return function(newVal) {
        _this.menuState.menuAlwaysVisible = newVal;
        return _this.scope.$applyAsync();
      };
    })(this));
  }

  Controller.prototype.menuItemVisible = function(stateName) {
    var state;
    state = this.state.get(stateName);
    if (state.deviceState == null) {
      return state.showInSideMenu;
    }
    return state.showInSideMenu && (state.deviceState.errorCodes != null);
  };

  Controller.prototype.menuItemActive = function(stateName) {
    return this.state.is(stateName);
  };

  Controller.prototype.criticalErrorsCount = function(state) {
    var errorCode, i, len, ref, ref1, result;
    result = 0;
    ref1 = (state != null ? (ref = state.deviceState) != null ? ref.errorCodes : void 0 : void 0) || [];
    for (i = 0, len = ref1.length; i < len; i++) {
      errorCode = ref1[i];
      if (this.isCriticalError(errorCode)) {
        result++;
      }
    }
    return result;
  };

  Controller.prototype.warningErrorsCount = function(state) {
    var errorCode, i, len, ref, ref1, result;
    result = 0;
    ref1 = (state != null ? (ref = state.deviceState) != null ? ref.errorCodes : void 0 : void 0) || [];
    for (i = 0, len = ref1.length; i < len; i++) {
      errorCode = ref1[i];
      if (this.isWarningError(errorCode)) {
        result++;
      }
    }
    return result;
  };

  Controller.prototype.warningBageNumber = function(stateName) {
    var state;
    state = this.state.get(stateName);
    return this.warningErrorsCount(state);
  };

  Controller.prototype.errorBageNumber = function(stateName) {
    var state;
    state = this.state.get(stateName);
    return this.criticalErrorsCount(state);
  };

  Controller.prototype.warningBadgeVisible = function(stateName) {
    return this.errorBageNumber(stateName) === 0 && this.warningBageNumber(stateName) > 0;
  };

  Controller.prototype.errorBadgeVisible = function(stateName) {
    return this.errorBageNumber(stateName) > 0;
  };

  return Controller;

})();

namespace('sys.auth.basic');

angular.module(['sys.auth.basic', '1.0.0'], ['ionic']).service('sys.auth.basic.Service', sys.auth.basic.Service);

var appendBaseTagToHead, appendBaseUrl, filesystem, loadScripts,
  slice = [].slice;

filesystem = sys.c0d3r.Filesystem;

sys.bootstrap = function(config) {
  angular.module(['sys.version', '1.0.0'], []).constant('version', config.coreVersion);
  angular.module(sys.mainModuleName, sys.modules.unique()).constant('sys.filesystem', filesystem).run([
    '$ionicPlatform', '$log', function($ionicPlatform, log) {
      return $ionicPlatform.ready(function() {
        var ref;
        if ((typeof cordova !== "undefined" && cordova !== null ? (ref = cordova.plugins) != null ? ref.Keyboard : void 0 : void 0) != null) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
          cordova.plugins.Keyboard.disableScroll(true);
        }
        return typeof StatusBar !== "undefined" && StatusBar !== null ? StatusBar.styleDefault() : void 0;
      });
    }
  ]).config([
    '$urlRouterProvider', '$compileProvider', function($urlRouterProvider, $compileProvider) {
      $urlRouterProvider.otherwise((config != null ? config.otherwiseUrl : void 0) || '/m/home');
      return $compileProvider.debugInfoEnabled(false);
    }
  ]);
  return angular.bootstrap(document, [sys.mainModuleName]);
};

appendBaseTagToHead = function(href) {
  var base, head;
  head = document.getElementsByTagName('head')[0];
  base = document.createElement('base');
  base.href = href;
  console.log("Base tag: " + href);
  return head.appendChild(base);
};

appendBaseUrl = function(dataSubdir, successCallback) {
  var onDataDirReady;
  if (dataSubdir == null) {
    return successCallback();
  }
  onDataDirReady = function(dir) {
    appendBaseTagToHead(dir.toURL());
    console.log(444, dir.toURL());
    return successCallback();
  };
  return filesystem.getDirectoryInDataDir(dataSubdir, {
    success: onDataDirReady,
    error: successCallback
  });
};

loadScripts = function(urls, success) {
  var head, ref, script, url;
  urls || (urls = []);
  if (!angular.isArray(urls) || (urls.length === 0)) {
    return success();
  } else {
    ref = urls, url = ref[0], urls = 2 <= ref.length ? slice.call(ref, 1) : [];
    head = document.getElementsByTagName('head')[0];
    script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onreadystatechange = function() {
      return loadScripts(urls, success);
    };
    script.onload = function() {
      return loadScripts(urls, success);
    };
    return head.appendChild(script);
  }
};

angular.element(document).ready(function() {
  var bootstrap, onDeviceReady;
  onDeviceReady = function() {
    return bootstrap();
  };
  bootstrap = function() {
    var configExists, defaultConfig, noConfig, runWithConfig;
    defaultConfig = {
      otherwiseUrl: '/m/home',
      coreVersion: '0.0.1',
      defaultModules: ['bundles/default/modules.js']
    };
    runWithConfig = function(config) {
      var defaultModules;
      console.log('runWithConfig', config);
      defaultModules = config.defaultModules || [];
      return loadScripts(defaultModules, function() {
        var subdir;
        if ((config != null ? config.bundle : void 0) != null) {
          subdir = "bundles/" + config.bundle;
        }
        return sys.modules.loadJsesInDataDir(subdir, function(entities) {
          var success;
          success = function() {
            return sys.bootstrap(config);
          };
          if (entities.length === 0) {
            appendBaseTagToHead('bundles/default/');
            success();
            return;
          }
          return loadScripts(entities, function() {
            if (filesystem.apiSupported()) {
              appendBaseUrl(subdir, success);
              return;
            }
            return success();
          });
        });
      });
    };
    if (!filesystem.apiSupported) {
      runWithConfig(defaultConfig);
    }
    configExists = function(config) {
      console.log('Config exists!');
      return filesystem.readAsText(config.name, {
        success: function(content) {
          console.log('content ', content);
          return runWithConfig(JSON.parse(content));
        },
        error: function() {
          return runWithConfig(defaultConfig);
        }
      });
    };
    noConfig = function() {
      console.log('No config exists!');
      return filesystem.saveAsText('config.json', JSON.stringify(defaultConfig), {
        success: function() {
          console.log('Config saved!');
          return runWithConfig(defaultConfig);
        },
        error: function() {
          runWithConfig(defaultConfig);
          return console.log('Config not saved!');
        }
      });
    };
    return filesystem.getFileInDataDir('config1.json', {
      success: configExists,
      error: noConfig
    });
  };
  if (typeof cordova !== "undefined" && cordova !== null) {
    return document.addEventListener('deviceready', onDeviceReady, false);
  } else {
    return onDeviceReady();
  }
});

namespace('sys.scrolling');

namespace('sys.menu');

sys.menu.mediaQuery = '(min-width:768px)';

angular.module(['sys.menu', '1.0.0'], ['ionic']).config([
  '$stateProvider', '$urlRouterProvider', '$compileProvider', function($stateProvider, $urlRouterProvider, $compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|filesystem|x-wmapp0):/);
    return $stateProvider.state('menu', {
      url: '/m',
      abstract: true,
      templateProvider: [
        '$state', 'menuViewTemplate', function($state, template) {
          var menuStates, st;
          menuStates = (function() {
            var i, len, ref, results;
            ref = $state.get();
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              st = ref[i];
              if ((st.showInSideMenu != null) && st.showInSideMenu) {
                results.push(st);
              }
            }
            return results;
          })();
          menuStates.sort(function(a, b) {
            if (a.order == null) {
              a.order = 1000;
            }
            if (b.order == null) {
              b.order = 1000;
            }
            if (a.order > b.order) {
              return 1;
            }
            if (a.order < b.order) {
              return -1;
            }
            return 0;
          });
          return template({
            menuStates: menuStates
          });
        }
      ]
    });
  }
]).constant('sys.menu.state', {
  menuAlwaysVisible: false
}).controller('sys.menu.Controller', sys.menu.Controller).constant('menuViewTemplate', _.template("<ion-side-menus>\n  <ion-side-menu-content>\n    <ion-nav-bar class=\"bar-balanced\">\n      <ion-nav-back-button>\n      0 Назад\n      </ion-nav-back-button>\n      <ion-nav-buttons side=\"left\">\n        <button ng-if=\"!controller.menuState.menuAlwaysVisible\" class=\"button button-icon button-clear ion-navicon\" menu-toggle=\"left\">\n        </button>\n      </ion-nav-buttons>\n    </ion-nav-bar>\n    <ion-nav-view name=\"menuContent\"></ion-nav-view>\n  </ion-side-menu-content>\n  <ion-side-menu side=\"left\" expose-aside-when=\"" + sys.menu.mediaQuery + "\" class=\"dark-bg\" width=\"200\">\n    <ion-header-bar class=\"bar-balanced\">\n      <h1 class=\"title\">Меню</h1>\n    </ion-header-bar>\n    <ion-content>\n      <div class=\"list\">\n        <% _.each(menuStates, function(menu, index) { %>\n          <div class=\"item item-dark\" nav-clear menu-close ng-class=\"{ active: controller.menuItemActive('<%=menu.name%>') }\" ui-sref=\"<%=menu.name%>()\" ng-show=\"controller.menuItemVisible('<%=menu.name%>')\">\n            <%=index + 1%> <%=menu.title%>\n            <span ng-if=\"controller.warningBadgeVisible('<%=menu.name%>')\" class=\"badge badge-energized\">{{controller.warningBageNumber('<%=menu.name%>')}}</span>\n            <span ng-if=\"controller.errorBadgeVisible('<%=menu.name%>')\" class=\"badge badge-assertive\">{{controller.errorBageNumber('<%=menu.name%>')}}</span>\n          </div>\n        <% }) %>\n      </div>\n    </ion-content>\n  </ion-side-menu>\n</ion-side-menus>"));
