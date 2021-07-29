var BigInt = function(str, length) {
   
   if (length > 2048) return null
   this.data = []
   this.sign = 1
   if (!length) length = 1

   if (!str.match) str = str.toString(10)
   if (!str) str = '0'
   else str = str.match(/^[+-]?[0-9 .]+$/) ? str : '0'
   str = str.replace(/[ .]/g, '')
   if (str.charAt(0) == '+') this.sign = 1
   if (str.charAt(0) == '-') this.sign = -1

   var i = 0
   if (str.charAt(0) == '+' || str.charAt(0) == '-') i++
   while (i < str.length && !str.charAt(i).match(/[1-9]/)) i++
   if (i == str.length) {
      this.sign = 0
      str = '0'
   }
   str = str.slice(i)
   length = Math.ceil(str.length / 4)
   if (!length > 0) length = 1

   for (var i = str.length; i < length; i++) {
      str = '0' + str
   }

   for (var i = 0; i < length; i++) {
      var pos = 0
      var group_length = 4
      var segment = str.length > group_length ? str.slice(str.length - group_length) : str
      str = str.slice(0, str.length - group_length)
      segment = segment.replace(/^(0)+/, '')
      this.data.push(parseInt(segment) & 0xFFFF)
   }
   this.print = function(sep) { return BigInt.print(this, sep) }

   return this
}

BigInt.prototype.toString = function() { return BigInt.print(this, ' ') }

BigInt.print = function(x, sep) {
   var str = ''
   var base = 10
   for (var i = 0; i < x.data.length; i++) {
      var s = x.data[i].toString()
      if (s < 10) s = '000' + s
      else if (s < 100) s = '00' + s
      else if (s < 1000) s = '0' + s
      str = s + str
   }
   str = str.replace(/^(0)+/, '')
   if (sep && sep != '') {
      for (var i = str.length-4; i >=0; ) {
         str = str.slice(0, i+1) + sep + str.slice(i+1)
         i -= 3
      }
   }
   if (str == '') str = '0'
   if (str != '0' && x.sign == -1) str = '-' + str
   return str
}

BigInt.comp = function(x, y) {
   if (!x.data && !isNaN(x)) x = BigInt(x.toString(10))
   if (!y.data && !isNaN(y)) y = BigInt(y.toString(10))

   var len = Math.max(x.data.length, y.data.length)
   if (!x.data || !x.data instanceof Array ||
       !y.data || !y.data instanceof Array) return null
   if (len > 2048) return null

   if (x.sign * y.sign < 0) {
      if (x.sign > 0) return 1
      else return -1
   }

   var a = [], b = []
   for (var i = 0; i < x.data.length; i++) {
      a.push(x.data[i])
   }
   while (i < len) { a.push(0); i++ }

   for (var i = 0; i < y.data.length; i++) {
      b.push(y.data[i])
   }
   while (i < len) { b.push(0); i++ }

   for (var i = len-1; i >= 0; i--) {
      if (a[i] > b[i]) return 1
      else if (a[i] < b[i]) return -1
   }

   return 0
}

BigInt.min = function(x, y) {
   if (this.comp(x, y) < 0) return x
   else return y
}

BigInt.max = function(x, y) {
   if (this.comp(x, y) > 0) return x
   else return y
}

BigInt.add = function(x, y) {
   if (!x.data && !isNaN(x)) x = BigInt(x.toString(10))
   if (!y.data && !isNaN(y)) y = BigInt(y.toString(10))

   if (!x.data && isNan(x) || !y.data && isNan(y)) return null

   var len = Math.max(x.data.length, y.data.length)

   if (len > 2048) return null

   if (x.data.length < len) {
      for (var i = x.data.length; i < len; i++) {
         x.data.push(0)
      }
   }
   if (y.data.length < len) {
      for (var i = y.data.length; i < len; i++) {
         y.data.push(0)
      }
   }

   if (x.sign * y.sign < 0) return this.sub(x, y)
   else if (x.sign * y.sign == 0) return BigInt('0', length)
   var obj = {}
   obj.data = []
   obj.print = function(sep) { return BigInt.print(this, sep) }
   obj.__proto__ = BigInt.prototype
   var carry = 0
   for (var i = 0; i < len; i++) {
      obj.data[i] = (x.data[i] + y.data[i]) % 10000 + carry
      carry = Math.floor((x.data[i] + y.data[i]) / 10000)
   }
   if (carry > 0) obj.data[len] = carry

   for (var i = len; x.data[i] == 0; i--) {
      if (i == 0) break
      x.data.pop()
   }
   for (var i = len; y.data[i] == 0; i--) {
      if (i == 0) break
      y.data.pop()
   }

   if (x.sign == -1 && y.sign == -1) obj.sign = -1
   else obj.sign = 1
   return obj
}

BigInt.sub = function(x, y) {
   if (!x.data && !isNaN(x)) x = BigInt(x.toString(10))
   if (!y.data && !isNaN(y)) y = BigInt(y.toString(10))

   if (!x.data && isNan(x) || !y.data && isNan(y)) return null

   if (this.comp(x, y) < 0) {
      var r = this.sub(y, x)
      r.sign = -1
      return r
   }

   var len = x.data.length
   if (len > 2048) return null

   if (y.data.length < len) {
      for (var i = y.data.length; i < len; i++) {
         y.data.push(0)
      }
   }

   if (x.sign * y.sign == 0 || this.comp(x, y) == 0) return BigInt('0', len)

   var obj = {}
   obj.data = []
   obj.print = function(sep) { return BigInt.print(this, sep) }
   obj.__proto__ = BigInt.prototype
   var carry = 0
   for (var i = 0; i < len; i++) {
      obj.data[i] = x.data[i] - y.data[i] + carry
      carry = 0
      if (obj.data[i] < 0) {
         carry = -1
         obj.data[i] += 10000
      }
   }
   if (carry < 0) {
      obj = this.sub(y, x) // Something went wrong
      obj.sign = -1
   }
   else obj.sign = 1

   for (var i = len; x.data[i] == 0; i--) {
      if (i == 0) break
      x.data.pop()
   }
   for (var i = len; y.data[i] == 0; i--) {
      if (i == 0) break
      y.data.pop()
   }

   return obj
}

BigInt.mul = function(x, y) {
   if (!x.data && !isNaN(x)) x = BigInt(x.toString(10))
   if (!y.data && !isNaN(y)) y = BigInt(y.toString(10))

   if (!x.data && isNan(x) || !y.data && isNan(y)) return null

   var len = x.data.length
   if (len > 2048) return null
   if (x.data.length < y.data.length) return this.mul(y, x)

   var obj = {}
   obj.data = []
   obj.print = function(sep) { return BigInt.print(this, sep) }
   obj.sign = x.sign * y.sign
   obj.__proto__ = BigInt.prototype
   var carry
   for (var i = 0; i < y.data.length; i++) {
      carry = 0
      for (var j = 0; j < len; j++) {
         if (isNaN(obj.data[i+j])) obj.data[i+j] = 0
         obj.data[i+j] += (x.data[j] * y.data[i] + carry)
         carry = Math.floor(obj.data[i+j] / 10000)
         obj.data[i+j] %= 10000
      }
      if (carry > 0) {
         if (isNaN(obj.data[len+i])) obj.data[len+i] = 0
         obj.data[len+i] = carry
      }
   }

   return obj
}

BigInt.div = function(x, y) {
   return BigInt.divmod(x,y)[0]
}

BigInt.mod = function(x, y) {
   return BigInt.divmod(x,y)[1]
}

BigInt.divmod = function(x, y) {
   if (!x.data && !isNaN(x)) x = BigInt(x.toString(10))
   if (!y.data && !isNaN(y)) y = BigInt(y.toString(10))

   if (!x.data && isNan(x) || !y.data && isNan(y)) return null

   if (this.comp(x, y) == -1) return [BigInt("0"), x]
   if (this.comp(x, y) == 0) return [BigInt("1"), BigInt("0")]

   var qhat, rhat, product, carry, temp, flag;

   var obj = {}
   obj.data = []
   obj.print = function(sep) { return BigInt.print(this, sep) }
   obj.sign = x.sign * y.sign

   var xc = {}
   xc.data = x.data.slice()
   xc.print = function(sep) { return BigInt.print(this, sep) }
   xc.sign = x.sign
   
   obj.__proto__ = BigInt.prototype
   xc.__proto__  = BigInt.prototype

   if(y.data.length == 1) {
      for (var i = xc.data.length-1; i >= 0; i--) {
         if (i < xc.data.length-1 && xc.data[i+1] > 0) {
            temp = xc.data[i+1] * 10000 + xc.data[i]
         } else {
            temp = xc.data[i]
         }
         if (i == xc.data.length-1 && temp < y.data[0]) {
            if (i < x.data.length-1) obj.data.unshift(0)
            continue
         }
         qhat = Math.floor(temp / y.data[0])
         obj.data.unshift(qhat)
         if (i < xc.data.length-1) {
            xc.data[i] -= qhat * y.data[0] % 10000
            xc.data[i+1] -= Math.floor(qhat * y.data[0] / 10000)
            if (xc.data[i+1] == 0) {
               delete xc.data[i+1]
               xc.data.length--
            }
         } else {
            xc.data[i] -= qhat * y.data[0]
            if (xc.data[i] == 0 && xc.data.length > 1) {
               delete xc.data[i]
               xc.data.length--
            }
         }
      }
      return [obj, xc]
   }

   var n = y.data.length

   var p = {}

   for(var j = xc.data.length-1; j >= n-1; j--) {
      if (j < xc.data.length-1 && xc.data[j+1] > 0) {
         qhat = Math.floor((xc.data[j+1] * 100000000 + xc.data[j]*10000 + xc.data[j-1]) / (y.data[n-1]*10000 + y.data[n-2]))
      } else {
         qhat = Math.floor((xc.data[j]*10000 + xc.data[j-1]) / (y.data[n-1]*10000 + y.data[n-2]))
      }
      if (qhat == 0) {
         if (j == n-1) break
         if (j < xc.data.length-1) obj.data.unshift(qhat)
         continue
      }
      var m = j-n+1
      p.data = []

      carry = 0
      for (var i = 0; i < n; i++) {
         p.data[i] = (qhat * y.data[i] + carry)
         p.data[i] %= 10000
         carry = Math.floor((qhat * y.data[i] + carry) / 10000)
      }
      if (carry > 0) {
         p.data[n] = carry
      }

      flag = false

      for (var i = 0; i < n; i++) {
         xc.data[m+i] -= p.data[i]
         if (xc.data[m+i] < 0) {
            xc.data[m+i] += 10000
            if (m+i+1 < xc.data.length) xc.data[m+i+1]--
            else flag = true
         }
      }
      if (p.data[n]) xc.data[m+n] -= p.data[n]
      if (xc.data[m+n] && xc.data[m+n] < 0 || flag) {
        qhat--
        for (var i = 0; i < n; i++) {
           xc.data[m+i] += y.data[i]
           if (xc.data[m+i] > 10000) {
              xc.data[m+i] -= 10000
              xc.data[m+i+1]++
           }
        }
      }
      if (xc.data[j+1] == 0) {
         delete xc.data[j+1]
         xc.data.length--
      }
      obj.data.unshift(qhat)
   }

   return [obj, xc]
}

BigInt.pow = function(base, power, mod) {
   if (!base.data && !isNaN(base)) base = BigInt(base.toString(10))

   var result = BigInt(1)
   while (power > 0) {
      if (power & 1 == 1) {
         result = BigInt.mul(result, base)
         if (mod) result = BigInt.mod(result, mod)
      }
      base = BigInt.mul(base, base)
      if (mod) base = BigInt.mod(base, mod)
      power = Math.floor(power / 2)
   }
   return result
}