var BigInt = function(str, length) {
   obj = {}
   if (length > this.MAX_SIZE) return null
   obj.data = []
   obj.sign = 1
   if (!length) length = 1
   
   if (!str) str = '0'
   else str = str.match(/^[+-]?[0-9]+$/) ? str : '0'
   if (str.charAt(0) == '+') obj.sign = 1
   if (str.charAt(0) == '-') obj.sign = -1
   
   var i = 0
   if (str.charAt(0) == '+' || str.charAt(0) == '-') i++
   while (i < str.length && !str.charAt(i).match(/[1-9]/)) i++
   if (i == str.length) {
      obj.sign = 0
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
      obj.data.push(parseInt(segment) & 0xFFFF)
   }
   obj.print = function(sep) { return BigInt.print(this, sep) }
   obj.type = 'BigInt'
   
   return obj
}

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
   if (str == '') str = '0'
   if (sep && sep.length && typeof sep == 'string') {
      for (i = str.length-3; i > 0; i-=3) {
         str = str.slice(0, i) + sep + str.slice(i)
      }
   }
   if (str != '0' && x.sign == -1) str = '-' + str
   return str
}

BigInt.comp = function(x, y) {
   var len = Math.max(x.data.length, y.data.length)
   if (len > this.MAX_SIZE) return null
   
   if (!x.data || !x.data instanceof Array) {
      x = new BigInt(x.toString(10))
   }
   if (!y.data || !y.data instanceof Array) {
      y = new BigInt(y.toString(10))
   }
   
   var a = [], b = []
   for (var i = 0; i < x.data.length; i++) {
      a.push(x.data[i])
   }
   while (i < len) {
      a.push(0)
      i++
   }
   
   for (var i = 0; i < y.data.length; i++) {
      b.push(y.data[i])
   }
   while (i < len) {
      b.push(0)
      i++
   }
   
   if (x.sign * y.sign < 0) {
      if (x.sign > 0) return 1
      else return -1
   }
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
   var len = Math.max(x.data.length, y.data.length)
   if (!x.data || !x.data instanceof Array) {
      x = new BigInt(x.toString(10))
   }
   if (!y.data || !y.data instanceof Array) {
      y = new BigInt(y.toString(10))
   }
       
   if (len > this.MAX_SIZE) return null
   
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
   obj.type = 'BigInt'
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
   if (!x.data || !x.data instanceof Array) {
      x = new BigInt(x.toString(10))
   }
   if (!y.data || !y.data instanceof Array) {
      y = new BigInt(y.toString(10))
   }
       
   if (this.comp(x, y) < 0) {
      var r = this.sub(y, x)
      r.sign = -1
      return r
   }
   
   var len = x.data.length
   if (len > this.MAX_SIZE) return null
   
   if (y.data.length < len) {
      for (var i = y.data.length; i < len; i++) {
         y.data.push(0)
      }
   }
   
   if (x.sign * y.sign == 0 || this.comp(x, y) == 0) return BigInt('0', len)
   
   var obj = {}
   obj.data = []
   obj.print = function(sep) { return BigInt.print(this, sep) }
   obj.type = 'BigInt'
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
   if (!x.data || !x.data instanceof Array) {
      x = new BigInt(x.toString(10))
   }
   if (!y.data || !y.data instanceof Array) {
      y = new BigInt(y.toString(10))
   }

   var len = x.data.length
   if (len > this.MAX_SIZE) return null
   if (x.data.length < y.data.length) return this.mul(y, x)

   var obj = {}
   obj.data = []
   obj.print = function(sep) { return BigInt.print(this, sep) }
   obj.sign = x.sign * y.sign
   obj.type = 'BigInt'
   var carry
   for (var i = 0; i < y.data.length; i++) {
      carry = 0
      for (var j = 0; j < len; j++) {
         if (isNaN(obj.data[i+j])) obj.data[i+j] = 0
         obj.data[i+j] += x.data[j] * y.data[i] + carry
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
   return BigInt.divmod(x, y)[0]
}

BigInt.mod = function(x, y) {
   return BigInt.divmod(x, y)[1]
}

BigInt.divmod = function(x, y) {
   if (!x.data || !x.data instanceof Array) {
      x = new BigInt(x.toString(10))
   }
   if (!y.data || !y.data instanceof Array) {
      y = new BigInt(y.toString(10))
   }
   
   var comp = this.comp(x, y)
   if (comp == -1) return [new BigInt('0'), y]
   if (comp ==  0) return [new BigInt('1'), new BigInt('0')]

   var qhat, rhat, product, carry, flag;
   
   var obj = {}
   obj.data = []
   obj.print = function(sep) { return BigInt.print(this, sep) }
   obj.sign = x.sign * y.sign
   obj.type = 'BigInt'
   
   var xc = {}
   xc.data = x.data.slice()
   xc.print = function(sep) { return BigInt.print(this, sep) }
   xc.sign = x.sign * y.sign
   xc.type = 'BigInt'

   if(y.data.length == 1) {
      for (var i = xc.data.length-1; i > 0; i--) {
         temp = xc.data[i] < y.data[0] ? xc.data[i] * 10000 + xc.data[i-1] : xc.data[i]
         qhat = Math.floor(temp / y.data[0])
         obj.data.unshift(qhat)
         if (xc.data[i] < y.data[0]) {
            xc.data[i] = 0
            if (xc.data[i-1] == 0) xc.data[i-1] = 10000
            xc.data[i-1] -= qhat * y.data[0] % 10000
         } else {
            xc.data[i] -= qhat * y.data[0] % 10000
            if (xc.data[i] > 0) i++
         }
      }
      return obj
   }
   
   var n = y.data.length
   
   var p = {}

   for(var j = xc.data.length-1; j >= n-1 || j < xc.data.length-1 && xc.data.length == y.data.length; j--) {
      if (j < xc.data.length-1) {
         qhat = Math.floor((xc.data[j+1]*100000000 + xc.data[j]*10000 + xc.data[j-1]) / (y.data[n-1]*10000 + y.data[n-2]))
      } else {
         qhat = Math.floor((xc.data[j]*10000 + xc.data[j-1]) / (y.data[n-1]*10000 + y.data[n-2]))
      }
      if (qhat == 0) {
         if (j == n-1) break
         if (obj.data.length && j < xc.data.length-1) {
            obj.data.unshift(qhat)
         }
         continue
      }
      var m = j-n+1
      p.data = []

      carry = 0
      for (var i = 0; i < n; i++) {
         p.data[i] = (qhat * y.data[i] + carry)
         carry = Math.floor(p.data[i] / 10000)
         p.data[i] %= 10000
      }
      if (carry > 0) {
         p.data[n] = carry
      }
      
      flag = false
      
      for (var i = 0; i < n; i++) {
         if (m+i == xc.data.length) {
            xc.data.push(0)
         }
         xc.data[m+i] -= p.data[i]
         if (xc.data[m+i] < 0) {
            if (m+i+1 < xc.data.length) {
               xc.data[m+i] += 10000
               xc.data[m+i+1]--
            } else {
               flag = true
            }
         }
      }
      if (p.data[n]) xc.data[m+n] -= p.data[n]
      if (xc.data[n] && xc.data[n] < 0 || flag) {
        qhat--
        for (var i = 0; i < n; i++) {
           xc.data[m+i] += y.data[i]
           if (xc.data[m+i] > 10000) {
              xc.data[m+i] -= 10000
              xc.data[m+i+1]++
           }
        }
      }
      if (j+1 < xc.data.length && xc.data[j+1] == 0) {
         xc.data.splice(j+1, 1)
      }
      for (var i = 0; i < n; i++) {
         if (xc.data[j-i] == 0) {
            xc.data.splice(j-i, 1)
            j--
         } else {
            break
         }
      }
      j = xc.data.length
      obj.data.unshift(qhat)
   }

   return [obj, xc]
}

BigInt.clone = function(n) {
   var m = new BigInt()
   m.sign = n.sign
   m.data = n.data.slice()
   return m
}

BigInt.pow = function(base, power, mod) {
   var _base = base.type && base.type == 'BigInt' ? BigInt.clone(base) : new BigInt(base.toString(10))
   var _mod = mod ? (mod.type && mod.type == 'BigInt' ? BigInt.clone(mod) : new BigInt(mod.toString(10))) : new BigInt()
   var result = BigInt.clone(_base)
   while (power > 0) {
      result = BigInt.mul(result, _base)
      power--
      if (result.data.length > 4096) {
         result = BigInt.mod(result, _mod)
      }
   }
   if (_mod.data.length > 1 || _mod.data[0] > 1) {
	   result = BigInt.mod(result, _mod)
   }
   return result
}

BigInt.MAX_SIZE = 200000