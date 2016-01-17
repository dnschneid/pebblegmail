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
  
  // Removes all tags, comments, scripts, etc.
  // Source: http://stackoverflow.com/a/430240
  stripHTMLTags: function(html) {
    if (!html)  return '';
    if (!this.stripHTMLTagRegex) {
      var tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';
      Util.stripHTMLTagRegex = new RegExp(
          '<(?:' +
          // Comment body.
          '!--(?:(?:[^>]|[^-]-?>)*--|-?)' +
          // Special "raw text" elements whose content should be elided.
          '|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*' +
          '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*' +
          // Regular name
          '|[/!]?[a-z]' + tagBody +
          ')>',
          'gi');
    }
    var oldHtml;
    do {
      oldHtml = html;
      html = html.replace(Util.stripHTMLTagRegex, '');
    } while (html !== oldHtml);
    return html.replace(/</g, '&lt;');
  },
  
  // Decodes HTML entities into proper characters
  // Source: https://gist.github.com/liamato/bb93806c921d7767aa3d
  htmlEntities: { quot: 34, amp: 38, lt: 60, gt: 62, nbsp: 160, copy: 169, reg: 174, deg: 176, frasl: 47, trade: 8482, euro: 8364, Agrave: 192, Aacute: 193, Acirc: 194, Atilde: 195, Auml: 196, Aring: 197, AElig: 198, Ccedil: 199, Egrave: 200, Eacute: 201, Ecirc: 202, Euml: 203, Igrave: 204, Iacute: 205, Icirc: 206, Iuml: 207, ETH: 208, Ntilde: 209, Ograve: 210, Oacute: 211, Ocirc: 212, Otilde: 213, Ouml: 214, times: 215, Oslash: 216, Ugrave: 217, Uacute: 218, Ucirc: 219, Uuml: 220, Yacute: 221, THORN: 222, szlig: 223, agrave: 224, aacute: 225, acirc: 226, atilde: 227, auml: 228, aring: 229, aelig: 230, ccedil: 231, egrave: 232, eacute: 233, ecirc: 234, euml: 235, igrave: 236, iacute: 237, icirc: 238, iuml: 239, eth: 240, ntilde: 241, ograve: 242, oacute: 243, ocirc: 244, otilde: 245, ouml: 246, divide: 247, oslash: 248, ugrave: 249, uacute: 250, ucirc: 251, uuml: 252, yacute: 253, thorn: 254, yuml: 255, lsquo: 8216, rsquo: 8217, sbquo: 8218, ldquo: 8220, rdquo: 8221, bdquo: 8222, dagger: 8224, Dagger: 8225, permil: 8240, lsaquo: 8249, rsaquo: 8250, spades: 9824, clubs: 9827, hearts: 9829, diams: 9830, oline: 8254, larr: 8592, uarr: 8593, rarr: 8594, darr: 8595, hellip: 133, ndash: 150, mdash: 151, iexcl: 161, cent: 162, pound: 163, curren: 164, yen: 165, brvbar: 166, brkbar: 166, sect: 167, uml: 168, die: 168, ordf: 170, laquo: 171, not: 172, shy: 173, macr: 175, hibar: 175, plusmn: 177, sup2: 178, sup3: 179, acute: 180, micro: 181, para: 182, middot: 183, cedil: 184, sup1: 185, ordm: 186, raquo: 187, frac14: 188, frac12: 189, frac34: 190, iquest: 191, Alpha: 913, alpha: 945, Beta: 914, beta: 946, Gamma: 915, gamma: 947, Delta: 916, delta: 948, Epsilon: 917, epsilon: 949, Zeta: 918, zeta: 950, Eta: 919, eta: 951, Theta: 920, theta: 952, Iota: 921, iota: 953, Kappa: 922, kappa: 954, Lambda: 923, lambda: 955, Mu: 924, mu: 956, Nu: 925, nu: 957, Xi: 926, xi: 958, Omicron: 927, omicron: 959, Pi: 928, pi: 960, Rho: 929, rho: 961, Sigma: 931, sigma: 963, Tau: 932, tau: 964, Upsilon: 933, upsilon: 965, Phi: 934, phi: 966, Chi: 935, chi: 967, Psi: 936, psi: 968, Omega: 937, omega: 969 },
  decodeHTMLEntities: function(html) {
    if (!html) return '';
    return html.replace(/&#?(\w+);/g, function(match, dec) {
      return String.fromCharCode(isNaN(dec) ? Util.htmlEntities[dec] || dec : dec);
    });
  },

  // Extracts text from HTML with some attempt to improve formatting
  decodeHTML: function(html) {
    html = Util.decodeHTMLEntities(Util.stripHTMLTags(html));
    // Collapse whitespace. Allow paragraph breaks
    return html.replace(/\s\s+/g, function(match) {
      var index = match.indexOf('\n');
      if (index === -1) return ' ';
      return match.lastIndexOf('\n') === index ? '\n' : '\n\n';
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

    /* Make the string proper UTF-8 */
    return decodeURIComponent(escape(output));
  },

  /* Recursively grabs the first text part of multipart messages
   * Prefers plaintext over html. */
  getMessageBody: function(message) {
    var body = null;
    if ('payload' in message) {
      if (!message.loaded) {
        return Util.decodeHTMLEntities(message.snippet);
      }
      if (message.payload.mimeType == 'pebble') {
        body = message.payload.data;
      } else {
        body = Util.getMessageBody(message.payload);
        if (!body || !body.data) {
          return '';
        }
        body.data = Util.decode64(body.data);
        body = body.html ? Util.decodeHTML(body.data) : body.data;
        /* Ditch the rest of the payload data and store the result */
        message.payload.mimeType = 'pebble';
        message.payload.data = body;
        message.payload.parts = [];
      }
      var limit = Pebble.getActiveWatchInfo().platform == 'aplite' ? 768 : 0;
      return limit ? body.substring(0, limit) : body;
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

  plural: function(number, text) {
    return number != 1 ? (text || 's') : '';
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
