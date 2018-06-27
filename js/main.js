if (!String.prototype.trim) {
  (function() {
    // Вырезаем BOM и неразрывный пробел
    String.prototype.trim = function() {
      return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
  })();
}
function _trim(str) {
  str = str + '';
  return str.trim();
}
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
  if (p > 200) {
    p = 200;
  }
  //h -= p;
  var html = '<div class="big-loader" style="width: '+w+'px; height: '+h+'px; padding-top: '+p+'px;">';
  html += '<img src="/images/ajax-loader-big.gif" style="width: '+iw+'px;" />';
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

function number_format(number, decimals, dec_point, thousands_sep) {
  var i, j, kw, kd, km;
  if (isNaN(decimals = Math.abs(decimals))) {
    decimals = 2;
  }
  if (dec_point == undefined) {
    dec_point = '.';
  }
  if (thousands_sep == undefined) {
    thousands_sep = ' ';
  }
  i = parseInt(number = (+number || 0).toFixed(decimals)) + '';
  if((j = i.length) > 3) {
    j = j % 3;
  } else {
    j = 0;
  }
  km = (j ? i.substr(0, j) + thousands_sep : '');
  kw = i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands_sep);
  kd = (decimals ? dec_point + Math.abs(number - i).toFixed(decimals).replace(/-/, 0).slice(2) : '');
  return km + kw + kd;
}


function _ajaxHtml(p) {
  var e = 'Internal Server Error';
  $.ajax({
    url: p.url,
    data: p.data || null,
    type: p.type || (p.data ? 'post' : 'get'),
    dataType: 'json',
    headers: p.headers || {},
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
  var e = 'Internal Server Error';
  $.ajax({
    url: p.url,
    data: p.data || null,
    type: p.type || (p.data ? 'post' : 'get'),
    dataType: 'json',
    headers: p.headers || {},
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

var Base64 = {
    // private property
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    // public method for encoding
    encode: function(input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = Base64._utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        }
        return output;
    },
    // public method for decoding
    decode: function(input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = Base64._utf8_decode(output);
        return output;
    },
    // private method for UTF-8 encoding
    _utf8_encode: function(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    },
    // private method for UTF-8 decoding
    _utf8_decode: function(utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;
        while (i < utftext.length) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }
}

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
    _val = _val.replace(/\.+/, '.');
    _val = _val.replace(/^\.(.*?)/, '0.$1');
    _val = _val.replace(/^([0-9]+\.[0-9]+)\..*?/, '$1');
    $(this).val(_val);
  });
  $(document).on('change keyup', '.num-int', function() {
    var _val = $(this).val();
    _val = _val.replace(/[^0-9]/, '');
    $(this).val(_val);
  });
});

$(function($) {
  try {
    if ($('#dropZone-wrap').length) {
      initDropZoneLoader();
    }
    if ($('.date').length) {
  		_initDatepicker($('.date'));
  	}
    if ($('#teamlist-00').length) {
      $('#teamlist-00').sortable({
        appendTo: $('.teamlist-wrapper'),
  		  containment: 'parent',
  		  items: ' > .persona',
  		  axis: 'y',
        update: function (event, ui) {
          rec_project_team_ids();
        }
      });
      initProjectTeamLoaders();
    }
    if ($('#teamlist-01').length) {
      $('#teamlist-01').sortable({
        appendTo: $('.teamlist-wrapper'),
  		  containment: 'parent',
  		  items: ' > .persona',
  		  axis: 'y',
        update: function (event, ui) {
          rec_project_investors_ids();
        }
      });
      initProjectInvestorsLoaders();
    }
    if ($('#teamlist-02').length) {
      $('#teamlist-02').sortable({
        appendTo: $('.teamlist-wrapper'),
  		  containment: 'parent',
  		  items: ' > .persona',
  		  axis: 'y',
        update: function (event, ui) {
          rec_project_advisors_ids();
        }
      });
      initProjectAdvisorsLoaders();
    }
    if ($('#teamlist-03').length) {
      $('#teamlist-03').sortable({
        appendTo: $('.teamlist-wrapper'),
  		  containment: 'parent',
  		  items: ' > .persona',
  		  axis: 'y',
        update: function (event, ui) {
          rec_project_testimonials_ids();
        }
      });
      initProjectTestimonialsLoaders();
    }
    if ($('.project_press .upload-image').length) {
      initProjectPressLoaders();
    }
    if ($('.faq-list').length) {
      initFaqList();
    }
    if (window.afterDocReady.length) {
      for (var i = 0; i < window.afterDocReady.length; i++) {
        window.afterDocReady[i]();
      }
    }
    if ($('.side-menu #list').length) {
      $('#list').ddscrollSpy({
        scrolltopoffset: 0 - ($('header').outerHeight())
      });
    }
    $('a[href=#]').on('click', function(e) {
      e.preventDefault();
    });
  } catch (err) {
    console.log('Error ' + err.name + ":" + err.message);
  }
});

function _initDatepicker(e) {
  $(e).datepicker({
    language: 'ru',
    format: 'mm.dd.yyyy',
    autoclose: true
  })
}

function _clearCloneEl(c) {
  c.find('select').val(0);
  c.find('input[type=text]').val('');
  c.find('textarea').val('');
  c.find('input[type=checkbox]').prop('checked', false);
  c.find('.def-hide').hide();
  c.find('.def-show').show();
  c.find('script').remove();
  c.find('.def-remove').remove();
  c.find('.def-selected').each(function() {
    $(this).val($(this).attr('data-selected'));
  });
  c.find('[data-add-class]').each(function() {
    $(this).addClass($(this).attr('data-add-class'));
  });
  c.find('[data-remove-class]').each(function() {
    $(this).removeClass($(this).attr('data-remove-class'));
  });
  c.find('input[type=checkbox].def-checked').prop('checked', true);
}

(function ($) {
  $.fn.extend({
    limit: function(p) {
      var interval;
      var self = $(this);
      p = p || {};

      var check_limit = function() {
        var val = self.val();
        var length = val.length;
        if (p.limit !== undefined) {
          if (length > p.limit) {
            self.val(val.substring(0, p.limit));
          }
        }
        if (p.update !== undefined) {
          p.update(length);
        }
      }

      self.focus(function() {
        interval = window.setInterval(check_limit, 100);
      });

      self.blur(function() {
        clearInterval(interval);
        check_limit();
      });

      check_limit();
    }
  });
})(jQuery);

$(window).load(function() {
  if (window.afterWinLoad.length) {
    for (var i = 0; i < window.afterWinLoad.length; i++) {
      window.afterWinLoad[i]();
    }
  }
});

function popupError(e) {
  if (!$('.alerts-popup').length) {
    $('body').prepend('<div class="alerts-popup"></div>');
  }
  var _id = $('.alerts-popup .alert').length + 1;
  var _html = '<div class="alert alert-warning alert-dismissible" id="alert-'+_id+'" role="alert">';
  _html += '<button type="button" class="close" data-dismiss="alert" aria-label="Close">';
  _html += '<span aria-hidden="true">×</span>';
  _html += '</button>';
  _html += e;
  _html += '</div>';
  $('.alerts-popup').append(_html);
  setTimeout(function(){
		$('.alerts-popup #alert-'+_id).alert('close');
    if (!$('.alerts-popup .alert').length) {
      $('.alerts-popup').remove();
    }
	}, 5000);
}
function popupSuccess(e) {
  if (!$('.alerts-popup').length) {
    $('body').prepend('<div class="alerts-popup"></div>');
  }
  var _id = $('.alerts-popup .alert').length + 1;
  var _html = '<div class="alert alert-success alert-dismissible" id="alert-'+_id+'" role="alert">';
  _html += '<button type="button" class="close" data-dismiss="alert" aria-label="Close">';
  _html += '<span aria-hidden="true">×</span>';
  _html += '</button>';
  _html += e;
  _html += '</div>';
  $('.alerts-popup').append(_html);
  setTimeout(function(){
		$('.alerts-popup #alert-'+_id).alert('close');
    if (!$('.alerts-popup .alert').length) {
      $('.alerts-popup').remove();
    }
	}, 5000);
}