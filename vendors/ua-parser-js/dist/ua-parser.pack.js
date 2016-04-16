/**
 * UAParser.js v0.7.9
 * Lightweight JavaScript-based User-Agent string parser
 * https://github.com/faisalman/ua-parser-js
 *
 * Copyright © 2012-2015 Faisal Salman <fyzlman@gmail.com>
 * Dual licensed under GPLv2 & MIT
 */
!function(i,e){"use strict";var s="0.7.9",o="",r="?",n="function",a="undefined",t="object",w="string",l="major",d="model",p="name",c="type",u="vendor",m="version",f="architecture",g="console",b="mobile",h="tablet",v="smarttv",x="wearable",k="embedded",y={extend:function(i,e){for(var s in e)-1!=="browser cpu device engine os".indexOf(s)&&e[s].length%2===0&&(i[s]=e[s].concat(i[s]));return i},has:function(i,e){return"string"==typeof i?-1!==e.toLowerCase().indexOf(i.toLowerCase()):!1},lowerize:function(i){return i.toLowerCase()},major:function(i){return typeof i===w?i.split(".")[0]:e}},A={rgx:function(){for(var i,s,o,r,w,l,d,p=0,c=arguments;p<c.length&&!l;){var u="c[p],m=c[p+1];if(typeof" i="==a){i={};for(r" in="" m)w="m[r],typeof" w="==t?i[w[0]]=e:i[w]=e}for(s=o=0;s<u.length&&!l;)if(l=u[s++].exec(this.getUA()))for(r=0;r<m.length;r++)d=l[++o],w=m[r],typeof">0?2==w.length?i[w[0]]=typeof w[1]==n?w[1].call(this,d):w[1]:3==w.length?i[w[0]]=typeof w[1]!==n||w[1].exec&&w[1].test?d?d.replace(w[1],w[2]):e:d?w[1].call(this,d,w[2]):e:4==w.length&&(i[w[0]]=d?w[3].call(this,d.replace(w[1],w[2])):e):i[w]=d?d:e;p+=2}return i},str:function(i,s){for(var o in s)if(typeof s[o]===t&&s[o].length>0){for(var n=0;n</c.length&&!l;){var></fyzlman@gmail.com>