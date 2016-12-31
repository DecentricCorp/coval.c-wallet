var bitcore=require("bitcore-lib");var bitcoreMessage=require("bitcore-message");var NETWORK=USE_TESTNET?bitcore.Networks.testnet:bitcore.Networks.livenet;var CWHierarchicalKey=function(b,a){checkArgType(b,"string");if(a){checkArgType(a,"string");b=CWBitcore.decrypt(b,a)}this.basePath="m/0'/0/";this.useOldHierarchicalKey=false;this.init(b)};CWHierarchicalKey.prototype.init=function(d){this.passphrase=d;var c=$.trim(d.toLowerCase()).split(" ");if(c.length==13){var b=c.shift();if(b=="old"){this.useOldHierarchicalKey=true}else{throw new Error("mnemonic was 13 words but fist was not 'old'")}}var a=CWHierarchicalKey.wordsToSeed(c);this.oldHierarchicalKey=bitcore.HDPrivateKey.fromSeed(bitcore.deps.Buffer(wordArrayToBytes(bytesToWordArray(a)),"ascii"),NETWORK);this.HierarchicalKey=this.useOldHierarchicalKey?this.oldHierarchicalKey:bitcore.HDPrivateKey.fromSeed(a,NETWORK)};CWHierarchicalKey.wordsToSeed=function(b){var a=new Mnemonic(b);return a.toHex()};CWHierarchicalKey.prototype.getOldAddressesInfos=function(g){var f=[];var d={};for(var b=0;b<=9;b++){var c=this.oldHierarchicalKey.derive(this.basePath+b);var e=new CWPrivateKey(c.privateKey);var a=e.getAddress();f.push(a);d[a]=e}Counterblock.getBalances(f,d,g)};CWHierarchicalKey.prototype.getAddressKey=function(a){checkArgType(a,"number");var b=this.HierarchicalKey.derive(this.basePath+a);return new CWPrivateKey(b.privateKey)};CWHierarchicalKey.prototype.cryptPassphrase=function(a){return CWBitcore.encrypt(this.passphrase,a)};CWHierarchicalKey.prototype.getQuickUrl=function(b){var a=location.protocol+"//"+location.hostname+"/#cp=";a+=this.cryptPassphrase(b);return a};var CWPrivateKey=function(a){this.priv=null;this.init(a)};CWPrivateKey.prototype.init=function(a){try{if(typeof a==="string"){a=bitcore.PrivateKey(a,NETWORK)}this.priv=a}catch(b){this.priv=null}};CWPrivateKey.prototype.getAddress=function(){return this.priv.toAddress(NETWORK).toString()};CWPrivateKey.prototype.getAltAddress=function(){var a=this.priv.toObject();a.compressed=!a.compressed;return bitcore.PrivateKey(a).toAddress(NETWORK).toString()};CWPrivateKey.prototype.getAddresses=function(){return[this.getAddress(),this.getAltAddress()]};CWPrivateKey.prototype.isValid=function(){try{return bitcore.Address.isValid(this.getAddress(),NETWORK,bitcore.Address.Pay2PubKeyHash)}catch(a){return false}};CWPrivateKey.prototype.getPub=function(){try{return this.priv.toPublicKey().toString()}catch(a){return false}};CWPrivateKey.prototype.signMessage=function(b,c){var a=bitcore.Message(b).sign(this.priv);return bitcore.deps.Buffer(a,"base64").toString(c||"base64")};CWPrivateKey.prototype.signRawTransaction=function(c,b,a){if(typeof b==="function"){a=b;b=null}checkArgType(a,"function");try{CWBitcore.signRawTransaction(c,this,b,a)}catch(d){async.nextTick(function(){a(d)})}};CWPrivateKey.prototype.checkTransactionDest=function(c,a){checkArgsType(arguments,["string","object"]);try{return CWBitcore.checkTransactionDest(c,this.getAddresses(),a)}catch(b){return false}};CWPrivateKey.prototype.checkAndSignRawTransaction=function(d,b,c,a){if(typeof(b)=="string"){b=[b]}if(typeof c==="function"){a=c;c=null}checkArgType(a,"function");try{if(this.checkTransactionDest(d,b)){this.signRawTransaction(d,c,a)}else{throw new Error("Failed to validate transaction destination")}}catch(e){async.nextTick(function(){a(e)})}};CWPrivateKey.prototype.getWIF=function(){return this.priv.toWIF()};CWPrivateKey.prototype.encrypt=function(a){return CWBitcore.encrypt(a,this.priv.toString())};CWPrivateKey.prototype.decrypt=function(a){return CWBitcore.decrypt(a,this.priv.toString())};var CWBitcore={};CWBitcore.isOutScript=function(a){return a.isPublicKeyOut()||a.isPublicKeyHashOut()||a.isMultisigOut()||a.isScriptHashOut()||a.isDataOut()};CWBitcore.isValidAddress=function(b){try{return bitcore.Address.isValid(b,NETWORK,bitcore.Address.Pay2PubKeyHash)}catch(a){return false}};CWBitcore.isValidMultisigAddress=function(g){try{var f=g.split("_");if(f.length!=4&&f.length!=5){return false}var e=parseInt(f.shift());var c=parseInt(f.pop());if(isNaN(e)||isNaN(c)||c!=f.length||e>c||e<1){return false}for(var b=0;b<f.length;b++){if(!CWBitcore.isValidAddress(f[b])){return false}}return true}catch(d){return false}};CWBitcore.MultisigAddressToAddresses=function(b){if(CWBitcore.isValidAddress(b)){return[b]}else{if(CWBitcore.isValidMultisigAddress(b)){var a=b.split("_");a.shift();a.pop();return a}else{return[]}}};CWBitcore.genKeyMap=function(b){var a={};b.forEach(function(c){a[c.getAddress()]=c.priv});return a};CWBitcore.signRawTransaction=function(e,g,d,a){if(typeof d==="function"){a=d;d=null}checkArgType(e,"string");checkArgType(g,"object");checkArgType(a,"function");try{var b=bitcore.Transaction(e);var h=CWBitcore.genKeyMap([g]);var c=[];async.forEachOf(b.inputs,function(k,j,i){(function(l){var o;var n=bitcore.Script(k._scriptBuffer.toString("hex"));var m;var p=[];switch(n.classify()){case bitcore.Script.types.PUBKEY_OUT:o=k.toObject();o.output=bitcore.Transaction.Output({script:k._scriptBuffer.toString("hex"),satoshis:0});b.inputs[j]=new bitcore.Transaction.Input.PublicKey(o);p=[n.toAddress(NETWORK).toString()];return l(null,p);case bitcore.Script.types.PUBKEYHASH_OUT:o=k.toObject();o.output=bitcore.Transaction.Output({script:k._scriptBuffer.toString("hex"),satoshis:0});b.inputs[j]=new bitcore.Transaction.Input.PublicKeyHash(o);p=[n.toAddress(NETWORK).toString()];return l(null,p);case bitcore.Script.types.MULTISIG_IN:o=k.toObject();return failoverAPI("get_script_pub_key",{tx_hash:o.prevTxId,vout_index:o.outputIndex},function(q){o.output=bitcore.Transaction.Output({script:q.scriptPubKey["hex"],satoshis:bitcore.Unit.fromBTC(q.value).toSatoshis()});m=CWBitcore.extractMultiSigInfoFromScript(o.output.script);o.signatures=bitcore.Transaction.Input.MultiSig.normalizeSignatures(b,new bitcore.Transaction.Input.MultiSig(o,m.publicKeys,m.threshold),j,n.chunks.slice(1,n.chunks.length).map(function(r){return r.buf}),m.publicKeys);b.inputs[j]=new bitcore.Transaction.Input.MultiSig(o,m.publicKeys,m.threshold);p=CWBitcore.extractMultiSigAddressesFromScript(o.output.script);return l(null,p)});case bitcore.Script.types.MULTISIG_OUT:o=k.toObject();o.output=bitcore.Transaction.Output({script:k._scriptBuffer.toString("hex"),satoshis:0});m=CWBitcore.extractMultiSigInfoFromScript(o.output.script);b.inputs[j]=new bitcore.Transaction.Input.MultiSig(o,m.publicKeys,m.threshold);p=CWBitcore.extractMultiSigAddressesFromScript(o.output.script);return l(null,p);case bitcore.Script.types.SCRIPTHASH_OUT:return l();case bitcore.Script.types.DATA_OUT:case bitcore.Script.types.PUBKEY_IN:case bitcore.Script.types.PUBKEYHASH_IN:case bitcore.Script.types.SCRIPTHASH_IN:return l();default:return l(new Error("Unknown scriptPubKey ["+n.classify()+"]("+n.toASM()+")"))}})(function(m,n){if(m){return i(m)}if(n===null){return i()}n=n.filter(function(p,o,q){return p&&q.indexOf(p)===o});var l=n.map(function(o){return typeof h[o]!=="undefined"?h[o]:null}).filter(function(o){return !!o});if(l.length===0){throw new Error("Missing private key to sign input: "+j)}c=c.concat(l);i()})},function(j){if(j){return async.nextTick(function(){a(j)})}c=c.filter(function(m,k,l){return m&&l.indexOf(m)===k});c.forEach(function(k){b.sign(k)});var i={disableIsFullySigned:d,disableSmallFees:true,disableLargeFees:true,disableDustOutputs:true,disableMoreOutputThanInput:true};async.nextTick(function(){a(null,b.serialize(i))})})}catch(f){async.nextTick(function(){a(f)})}};CWBitcore.extractMultiSigAddressesFromScript=function(c){checkArgType(c,"object");if(!c.isMultisigOut()){return[]}var b=bitcore.Opcode(c.chunks[c.chunks.length-2].opcodenum).toNumber()-bitcore.Opcode.map.OP_1+1;var a=c.chunks.slice(c.chunks.length-2-b,c.chunks.length-2);return a.map(function(d){return bitcore.Address(bitcore.crypto.Hash.sha256ripemd160(d.buf),NETWORK,bitcore.Address.PayToPublicKeyHash).toString()})};CWBitcore.extractMultiSigInfoFromScript=function(c){checkArgType(c,"object");if(!c.isMultisigOut()){return[]}var b=bitcore.Opcode(c.chunks[c.chunks.length-2].opcodenum).toNumber()-bitcore.Opcode.map.OP_1+1;var a=bitcore.Opcode(c.chunks[c.chunks.length-b-2-1].opcodenum).toNumber()-bitcore.Opcode.map.OP_1+1;return{publicKeys:c.chunks.slice(c.chunks.length-2-b,c.chunks.length-2).map(function(d){return bitcore.PublicKey(d.buf)}),threshold:a}};CWBitcore.extractAddressFromTxOut=function(a){checkArgType(a,"object");switch(a.script.classify()){case bitcore.Script.types.PUBKEY_OUT:return a.script.toAddress(NETWORK).toString();case bitcore.Script.types.PUBKEYHASH_OUT:return a.script.toAddress(NETWORK).toString();case bitcore.Script.types.SCRIPTHASH_OUT:return a.script.toAddress(NETWORK).toString();case bitcore.Script.types.MULTISIG_OUT:var b=CWBitcore.extractMultiSigAddressesFromScript(a.script);return b.join(",");case bitcore.Script.types.DATA_OUT:return"";default:throw new Error("Unknown type ["+a.script.classify()+"]")}};CWBitcore.extractChangeTxoutValue=function(b,c){checkArgsType(arguments,["string","string"]);var a=bitcore.Transaction(c);return a.outputs.map(function(f,d){var e=CWBitcore.extractAddressFromTxOut(f);if(e&&e==b){return f.satoshis}return 0}).reduce(function(d,e){return e+d})};CWBitcore.checkTransactionDest=function(e,d,c){checkArgsType(arguments,["string","object","object"]);d=[].concat.apply([],d.map(function(f){return CWBitcore.MultisigAddressToAddresses(f)}));c=[].concat.apply([],c.map(function(f){return CWBitcore.MultisigAddressToAddresses(f)}));var a=bitcore.Transaction(e);var b=a.outputs.map(function(h,f){var g=null;switch(h.script.classify()){case bitcore.Script.types.PUBKEY_OUT:g=h.script.toAddress(NETWORK).toString();break;case bitcore.Script.types.PUBKEYHASH_OUT:g=h.script.toAddress(NETWORK).toString();break;case bitcore.Script.types.SCRIPTHASH_OUT:g=h.script.toAddress(NETWORK).toString();break;case bitcore.Script.types.MULTISIG_OUT:var m=CWBitcore.extractMultiSigAddressesFromScript(h.script);var k=c.sort().join()==m.sort().join();var j=d.sort().join()==m.sort().join();return h.satoshis<=Math.max(MULTISIG_DUST_SIZE,REGULAR_DUST_SIZE*2)||k||j;case bitcore.Script.types.DATA_OUT:return true;default:throw new Error("Unknown type ["+h.script.classify()+"]")}var l=_.intersection([g],d).length>0;var i=_.intersection([g],c).length>0;return i||l});return b.filter(function(f){return !f}).length===0};CWBitcore.compareOutputs=function(e,a){var c;if(a[0].indexOf("=====TXSIGCOLLECT")!=-1){for(c=1;c<a.length;c++){if(a[c]!=a[0]){return false}}return true}else{var b=bitcore.Transaction(a[0]);var d=a.map(function(i,f){if(f===0){return true}var g=bitcore.Transaction(i);if(b.outputs.length!=g.outputs.length){return false}var h=b.outputs.map(function(k,j){var o=CWBitcore.extractAddressFromTxOut(k).split(",").sort().join(",");var n=CWBitcore.extractAddressFromTxOut(g.outputs[j]).split(",").sort().join(",");var m=k.satoshis;var l=g.outputs[j].satoshis;return o==n&&(m==l||o.indexOf(e)!=-1)});return h.filter(function(j){return !j}).length===0});return d.filter(function(f){return !f}).length===0}};CWBitcore.pubKeyToPubKeyHash=function(a){return bitcore.Address.fromPublicKey(bitcore.PublicKey(a,{network:NETWORK}),NETWORK).toString()};CWBitcore.encrypt=function(b,a){return CryptoJS.AES.encrypt(b,a).toString()};CWBitcore.decrypt=function(b,a){return CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(b,a))};CWBitcore.getQuickUrl=function(c,b){var a=location.protocol+"//"+location.hostname+"/#cp=";a+=CWBitcore.encrypt(c,b);return a};