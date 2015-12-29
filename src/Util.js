var Util = {
  // '19:00'
  formatTime: function(date) {
    return date.toTimeString().substring(0, 5);
  },

  // 'Wed Jul 28'
  formatDate: function(date) {
    return date.toDateString().substring(0, 10);
  },

  trimLine: function(str) {
    return str.substring(0, 30);
  },

  // 'Wed Jul 28 19:00'
  getMessageDateTime: function(message) {
    var date = new Date(+message.internalDate);
    return Util.formatDate(date) + ', ' + Util.formatTime(date);
  },

  getMessageHeader: function(message, headerName) {
    var headers = message.payload.headers;
    for (var i = 0; i < headers.length; i++) {
      if (headers[i].name === headerName) {
        return headers[i].value;
      }
    }
    return '';
  },

  getMessageFromHeader: function(message) {
    var from = this.getMessageHeader(message, 'From');
    var bracketIndex = from.indexOf('<');

    // If the only thing in the from header is '<email>', keep it.
    if (bracketIndex > 0) {
      return from.substring(0, bracketIndex).trim();
    } else {
      return from;
    }
  },

  getMessageSubjectHeader: function(message) {
    return this.getMessageHeader(message, 'Subject') || '(no subject)';
  },

  // Decodes html text from html entities and tags
  // Credit: https://gist.github.com/CatTail/4174511
  decodeHTML: function(str) {
    if (!str) return '';
    return str.replace(/<[^>]*>/g, "").replace(/&#(\d+);/g, function(match, dec) {
      return String.fromCharCode(dec);
    });
  },

  // Decodes base64
  // Credit: http://ntt.cc/2008/01/19/base64-encoder-decoder-with-javascript.html
  base64keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
                "abcdefghijklmnopqrstuvwxyz" +
                "0123456789-_=",
  decode64: function(input, maxlength) {
    var output = "";
    var chr1, chr2, chr3 = "";
    var enc1, enc2, enc3, enc4 = "";
    var i = 0;
    maxlength = maxlength ? (maxlength * 4 + 2) / 3 : input.length;
    maxlength = maxlength < input.length ? maxlength : input.length;

    do {
      enc1 = this.base64keyStr.indexOf(input.charAt(i++));
      enc2 = this.base64keyStr.indexOf(input.charAt(i++));
      enc3 = this.base64keyStr.indexOf(input.charAt(i++));
      enc4 = this.base64keyStr.indexOf(input.charAt(i++));

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

      chr1 = chr2 = chr3 = "";
      enc1 = enc2 = enc3 = enc4 = "";

    } while (i < maxlength);

    return output;
  },

  /* Recursively grabs the first text part of multipart messages
   * Prefers plaintext over html. */
  getMessageBody: function(message) {
    var body = null;
    if ('payload' in message) {
      if (!message.loaded) {
        return Util.decodeHTML(message.snippet || '');
      }
      body = Util.getMessageBody(message.payload);
      if (!body || !body.data) {
        return '';
      }
      body.data = Util.decode64(body.data, 1024);
      return body.html ? Util.decodeHTML(body.data) : body.data;
    } else if (message.mimeType.substring(0, 4) == 'text' && message.body.data) {
      return { html: message.mimeType.slice(-4) == 'html', data: message.body.data };
    } else if (message.mimeType.substring(0, 9) == 'multipart') {
      for (var i = 0; i < message.parts.length; i++) {
        var part = Util.getMessageBody(message.parts[i]);
        if (part && !part.html) {
          return part;
        } else if (part && part.html && !body) {
          body = part;
        }
      }
    }
    return body;
  },

  getFriendlyLabelName: function(label) {
    if (label.type === 'system') {
      var match = /^CATEGORY_(.*)$/.exec(label.id);
      if (match) {
        return Util.capitalize(match[1]);
      } else {
        return Util.capitalize(label.name);
      }
    }
    return label.name;
  },

  capitalize: function(str) {
    if (str) {
      return str[0].toUpperCase() + str.substring(1).toLowerCase();
    }
    return '';
  },

  systemLabelSortComparator: function(a, b) {
    var priorities = {
      UNREAD: 1,
      STARRED: 2,
      IMPORTANT: 3,
      INBOX: 4,
      SPAM: 5,
      TRASH: 6
    };
    return (priorities[a.label.id] || 9) - (priorities[b.label.id] || 9);
  }
};

module.exports = Util;
