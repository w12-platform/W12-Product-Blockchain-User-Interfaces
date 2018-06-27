$(function () {
  /*$('.icon-tip').each(function() {
    $(this).poshytip({
      className: 'poshytip',
      showTimeout: 10,
      offsetX: 0
    });
  });*/
  $('.icon-tip').tooltip();
  $('input.phone-input').mask('+7(999)999-99-99');
  $('.fancybox').fancybox();
});

function addBigLoader(e) {
  $(e).find('.big-loader').remove();
  $(e).css('position', 'relative');
  var w = $(e).outerWidth();
  var h = $(e).outerHeight();
  var iw = 81;
  if (h < 100) {
    iw = h - 20;
  }
  if (iw < 0) {
    iw = 0;
  }
  var p = Math.round((h - iw)/2);
  h -= p;
  var html = '<div class="big-loader" style="width: '+w+'px; height: '+h+'px; padding-top: '+p+'px;">';
  html += '<img src="/images/admin/ajax-loader-big.gif" style="width: '+iw+'px;" />';
  html += '</div>';
  $(e).append(html);
}
function deleteBigLoader(e) {
  $(e).find('.big-loader').remove();
}

function suffix(count, s1, s2, s3) {
  count = count + '';
  if (count != '') {
    count = count.split(/(.)/);
    if (count.length) {
      var s = [];
      for (var i = 0; i < count.length; i++) {
        if(count[i] != '') {
          s[s.length] = count[i];
        }
      }
      if(s.length) {
        s = s.reverse();
        if(s.length == 1) {
          s[1] = 0;
        }
        if (s[0] == 1 && s[1] != 1) {
          return s1;
        }
        if (s[0] > 1 && s[0] < 5 && s[1] != 1) {
          return s2;
        }
      }
    }
  }
  return s3;
}

function dump(arr, level) {
  var dumped_text = '';
  if (!level) {
    level = 0;
  }
  var level_padding = '';
  for (var j = 0; j < level + 1; j++) {
    level_padding += '    ';
  }
  if (typeof(arr) == 'object') {
    // Array/Hashes/Objects
    for (var item in arr) {
      var value = arr[item];
      if (typeof(value) == 'object') {
        //If it is an array,
        dumped_text += level_padding + "'" + item + "' ...\n";
        dumped_text += dump(value, level+1);
      } else {
        dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
      }
    }
  } else {
    // Stings/Chars/Numbers etc.
    dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
  }
  return dumped_text;
}

function _esc(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _ajaxHtml(p) {
  var e = 'Сбой сервера';
  $.ajax({
    url: p.url,
    data: p.data || null,
    type: p.type || 'post',
    dataType: 'json',
    success: function(json) {
      if (json && json.error !== undefined) {
        if (json.error != '') {
          e = json.error;
        } else {
          if (json.html !== undefined) {
            p.success(json.html);
            return true;
          }
        }
      }
      if (p.error) {
        p.error(e);
      }
    },
    error: function() {
      if (p.error) {
        p.error(e);
      }
    }
  });
}

function _ajaxJson(p) {
  var e = 'Сбой сервера';
  $.ajax({
    url: p.url,
    data: p.data || null,
    type: p.type || 'post',
    dataType: 'json',
    success: function(json) {
      if (json && json.error !== undefined) {
        if (json.error != '') {
          e = json.error;
        } else {
          p.success(json);
          return true;
        }
      }
      if (p.error) {
        p.error(e);
      }
    },
    error: function() {
      if (p.error) {
        p.error(e);
      }
    }
  });
}

function initTinymceEditor(p) {
  p.toolbar1 = p.toolbar1 !== undefined ? p.toolbar1 : "bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | styleselect formatselect fontselect fontsizeselect";
  p.toolbar2 = p.toolbar2 !== undefined ? p.toolbar2 : "cut copy paste | searchreplace | bullist numlist | outdent indent blockquote | undo redo | link unlink anchor image media code | insertdatetime preview | forecolor backcolor";
  p.toolbar3 = p.toolbar3 !== undefined ? p.toolbar3 : "table | hr removeformat | subscript superscript | charmap emoticons | print fullscreen | ltr rtl | spellchecker | visualchars visualblocks nonbreaking template pagebreak";

  var options = {
    script_url: '/js/admin/tinymce/tinymce.gzip.php',
    plugins: [
      "advlist,autolink,link,image,lists,charmap,print,preview,hr,anchor,pagebreak,spellchecker,responsivefilemanager",
      "searchreplace,wordcount,visualblocks,visualchars,code,fullscreen,insertdatetime,media,nonbreaking",
      "table,contextmenu,directionality,emoticons,template,textcolor,paste,textcolor,colorpicker,textpattern"
    ],
    toolbar1: p.toolbar1,
    toolbar2: p.toolbar2,
    toolbar3: p.toolbar3,
    menubar: false,
    language : 'ru',
    toolbar_items_size: 'small',
    relative_urls: false,
    height: (p.height - 118),
    external_filemanager_path: "/tools/filemanager/",
    filemanager_title: "Менеджер файлов",
    external_plugins: { "filemanager" : "/tools/filemanager/plugin.min.js"}
  }

  if (p.block_formats !== undefined) {
    options.block_formats = p.block_formats;
  }

  $(p.selector).tinymce(options);
}

var dateFormat = function () {
  var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
      timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
      timezoneClip = /[^-+\dA-Z]/g,
      pad = function (val, len) {
          val = String(val);
          len = len || 2;
          while (val.length < len) val = "0" + val;
          return val;
      };

  // Regexes and supporting functions are cached through closure
  return function (date, mask, utc) {
      var dF = dateFormat;

      // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
      if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
          mask = date;
          date = undefined;
      }

      // Passing date through Date applies Date.parse, if necessary
      date = date ? new Date(date) : new Date;
      if (isNaN(date)) {
        return '';
        //throw SyntaxError("invalid date");
      }

      mask = String(dF.masks[mask] || mask || dF.masks["default"]);

      // Allow setting the utc argument via the mask
      if (mask.slice(0, 4) == "UTC:") {
          mask = mask.slice(4);
          utc = true;
      }

      var    _ = utc ? "getUTC" : "get",
          d = date[_ + "Date"](),
          D = date[_ + "Day"](),
          m = date[_ + "Month"](),
          y = date[_ + "FullYear"](),
          H = date[_ + "Hours"](),
          M = date[_ + "Minutes"](),
          s = date[_ + "Seconds"](),
          L = date[_ + "Milliseconds"](),
          o = utc ? 0 : date.getTimezoneOffset(),
          flags = {
              d:    d,
              dd:   pad(d),
              ddd:  dF.i18n.dayNames[D],
              dddd: dF.i18n.dayNames[D + 7],
              m:    m + 1,
              mm:   pad(m + 1),
              mmm:  dF.i18n.monthNames[m],
              mmmm: dF.i18n.monthNames[m + 12],
              yy:   String(y).slice(2),
              yyyy: y,
              h:    H % 12 || 12,
              hh:   pad(H % 12 || 12),
              H:    H,
              HH:   pad(H),
              M:    M,
              MM:   pad(M),
              s:    s,
              ss:   pad(s),
              l:    pad(L, 3),
              L:    pad(L > 99 ? Math.round(L / 10) : L),
              t:    H < 12 ? "a"  : "p",
              tt:   H < 12 ? "am" : "pm",
              T:    H < 12 ? "A"  : "P",
              TT:   H < 12 ? "AM" : "PM",
              Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
              o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
              S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
          };

      return mask.replace(token, function ($0) {
          return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
      });
  };
}();

// Some common format strings
dateFormat.masks = {
  "default":      "ddd mmm dd yyyy HH:MM:ss",
  shortDate:      "m/d/yy",
  mediumDate:     "mmm d, yyyy",
  longDate:       "mmmm d, yyyy",
  fullDate:       "dddd, mmmm d, yyyy",
  shortTime:      "h:MM TT",
  mediumTime:     "h:MM:ss TT",
  longTime:       "h:MM:ss TT Z",
  isoDate:        "yyyy-mm-dd",
  isoTime:        "HH:MM:ss",
  isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
  isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
  dayNames: [
      "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ],
  monthNames: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
  ]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
  return dateFormat(this, mask, utc);
};

$(function() {
  $(document).on('focus', '.selectall', function() {
    var $this = $(this);
    if ($this.prop('disabled') || $this.prop('readonly')) {
      return false;
    }
    $this.select();
    // Work around Chrome's little problem
    $this.mouseup(function() {
      // Prevent further mouseup intervention
      $this.unbind("mouseup");
      return false;
    });
  });
  $(document).on('change keyup', '.num-float', function() {
    var _val = $(this).val();
    _val = _val.replace(',', '.');
    _val = _val.replace(/[^0-9.]/, '');
    $(this).val(_val);
  });
  $(document).on('change keyup', '.num-int', function() {
    var _val = $(this).val();
    _val = _val.replace(/[^0-9]/, '');
    $(this).val(_val);
  });
});